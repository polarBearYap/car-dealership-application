import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { CHART_COLORS, transparentize } from './color_utils'
import { delay, enableDrag, setVisible, BarChartConfig, createBarChart, FeatureImportance, preprocessFIs } from './ui_controller';
import zoomPlugin, { resetZoom } from 'chartjs-plugin-zoom';

type PredictionResult = {
    raw_feature_names: string[],
    engineered_feature_names: string[],
    raw_local_feature_importance: [number[]],
    engineered_local_feature_importance: [number[]],
    predictions: number[]
}

function predictPrice(predictInput: object) {
    // Show loading screen first
    $('#loading-subpage').removeClass('display-none-important');
    $('#prediction-display').addClass('display-none-important');

    fetch("https://car-dealership-api.azurewebsites.net/api/v1/car_price/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictInput)
    })
        .then(response => {
            console.log(response);
            let json = response.json();
            console.log(json);
            return json;
        })
        .then((result: PredictionResult) => {
            let prediction = result.predictions[0];
            let rawFeatureNames = result.raw_feature_names;
            let engineeredFeatureNames = result.engineered_feature_names;
            let rawFiValues = result.raw_local_feature_importance[0];
            let engineeredFiValues = result.engineered_local_feature_importance[0];

            const zip = (a: string[], b: number[]) => a.map((k, i) => { k: b[i] });

            let localRawFi: FeatureImportance = {};
            rawFeatureNames.forEach((key, i) => localRawFi[key] = rawFiValues[i]);
            let localEngineeredFi: FeatureImportance = {};
            engineeredFeatureNames.forEach((key, i) => localEngineeredFi[key] = engineeredFiValues[i]);

            let [localRawFiX, localRawFiY, localEngineeredFiX, localEngineeredFiY] = preprocessFIs([localRawFi, localEngineeredFi]);

            let localRawFIDOM: HTMLCanvasElement = document.getElementById('localRawFI') as HTMLCanvasElement;
            let localEngineeredFIDOM: HTMLCanvasElement = document.getElementById('localEngineeredFI') as HTMLCanvasElement;

            // Config for local raw feature importance
            const rawGFIChartConfig: BarChartConfig = {
                DOM: localRawFIDOM,
                x: localRawFiX,
                y: localRawFiY,
                xLabel: 'Raw features',
                yLabel: 'Local feature importance',
                legendLabel: 'Local feature importance (Raw)',
                borderColor: CHART_COLORS.red,
                backgroundColor: transparentize(CHART_COLORS.red, 0.2),
                borderWidth: 1
            };

            // Config for local engineered feature importance
            const engineeredGFIChartConfig: BarChartConfig = {
                DOM: localEngineeredFIDOM,
                x: localEngineeredFiX,
                y: localEngineeredFiY,
                xLabel: 'Engineered features',
                yLabel: 'Local feature importance',
                legendLabel: 'Local feature importance (Engineered)',
                borderColor: CHART_COLORS.blue,
                backgroundColor: transparentize(CHART_COLORS.blue, 0.2),
                borderWidth: 1
            };

            // Destroy previously initialised chart.js objects so that new charts can be drawn
            let prevLocalRawFIChart: Chart = $(localRawFIDOM).data('chart');
            let prevLocalEngineeredFIChart: Chart = $(localEngineeredFIDOM).data('chart');

            if (prevLocalRawFIChart) {
                prevLocalRawFIChart.destroy();
            }
            if (prevLocalEngineeredFIChart) {
                prevLocalEngineeredFIChart.destroy();
            }

            // Create bar chart for local raw feature importance
            let localRawFIChart = createBarChart(rawGFIChartConfig);
            // Create bar chart for local engineered feature importance
            let localEngineeredFIChart = createBarChart(engineeredGFIChartConfig);

            // Save the chart.js objects correspond to DOM elements, (better alternative than storing in windows object)
            // Source: https://stackoverflow.com/a/12393346
            $(localRawFIDOM).data('chart', localRawFIChart);
            $(localEngineeredFIDOM).data('chart', localEngineeredFIChart);

            // Reset event handler
            $('#localRawFIZoom').off('click');
            $('#localEngineeredFIZoom').off('click');

            // Add reset zoom button
            $('#localRawFIZoom').on('click', function (event) {
                event.preventDefault();
                resetZoom(localRawFIChart);
            });

            $('#localEngineeredFIZoom').on('click', function (event) {
                event.preventDefault();
                resetZoom(localEngineeredFIChart);
            });

            let priceRM = new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(prediction);
            $('#prediction').html(`The predicted price is <strong>${priceRM}</strong>.`);
        })
        .then(param => {
            // After the chart is loaded, remove the loading screen and add the loaded content
            $('#loading-subpage').addClass('display-none-important');
            $('#prediction-display').removeClass('display-none-important');
        })
        .catch((error) => {
            // For debugging purposes
            console.error('Error:', error);
        });
}

export function load() {
    $(document).ready(function () {
        // Load the zoom plugins
        Chart.register(zoomPlugin);

        let predictPriceFunc = predictPrice;

        $(".predict-form").on("submit", function (event) {
            // Prevent form submission
            event.preventDefault();

            $.ajax({
                url: "/Cars/Predict",
                type: "POST",
                data: $(this).serialize(),
                traditional: true,
                success: function (result) {
                    if (result['valid']) {
                        const predictInput = JSON.parse(result['data']);
                        console.log('Calling the predictPrice function', JSON.stringify([predictInput]));
                        predictPriceFunc([predictInput]);
                    }
                    else {
                        console.log(result['data']);
                        let modelStateErrors = result['data'];
                        for (var i = 0; i < modelStateErrors.length; i++) {
                            let selectedErrorText = $('span[data-valmsg-for="' + modelStateErrors[i].key + '"]');
                            if (selectedErrorText.text() === undefined || selectedErrorText.text() === '') {
                                selectedErrorText.text(modelStateErrors[i].errors[0]);
                            }
                        }

                        $('.predict-form input.form-control,select.form-control').each(function () {
                            let identifier = $(this).attr('name');
                            let selectedErrorText = $('span[data-valmsg-for="' + identifier + '"]');
                            if (selectedErrorText.text()) {
                                $(this).focus();
                                return false;
                            }
                        })
                    }
                },
                error: function (error) {
                    console.log(error);
                }
            });
        });
    });
}