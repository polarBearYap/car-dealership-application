import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { CHART_COLORS, transparentize } from './color_utils'
import { delay, enableDrag, setVisible, BarChartConfig, createBarChart, FeatureImportance, preprocessFIs } from './ui_controller';
import zoomPlugin, { resetZoom } from 'chartjs-plugin-zoom';

// --------------------------------------------------------------------------
// Custom functions start
// --------------------------------------------------------------------------

async function loadCharts() {
    while ($('#page').css('display') === 'none')
        await delay(1000);

    fetch('https://car-dealership-api.azurewebsites.net/api/v1/car_price/global_feature_importance', {
        method: 'GET'
    })
        .then(response => response.json())
        .then((feature_importances: Array<FeatureImportance>) => {
            // Extract raw and engineered global feature importances, respectively
            let [globalRawFiX, globalRawFiY, globalEngineeredFiX, globalEngineeredFiY] = preprocessFIs(feature_importances);

            // Config for global raw feature importance
            const rawGFIChartConfig : BarChartConfig = {
                DOM: document.getElementById('globalRawFI') as HTMLCanvasElement,
                x: globalRawFiX,
                y: globalRawFiY,
                xLabel: 'Raw features',
                yLabel: 'Global feature importance',
                legendLabel: 'Global feature importance (Raw)',
                borderColor: CHART_COLORS.red,
                backgroundColor: transparentize(CHART_COLORS.red, 0.2),
                borderWidth: 1
            };

            // Create bar chart for global raw feature importance
            let globalRawFIChart = createBarChart(rawGFIChartConfig);

            // Config for global engineered feature importance
            const engineeredGFIChartConfig: BarChartConfig = {
                DOM: document.getElementById('globalEngineeredFI') as HTMLCanvasElement,
                x: globalEngineeredFiX,
                y: globalEngineeredFiY,
                xLabel: 'Engineered features',
                yLabel: 'Global feature importance',
                legendLabel: 'Global feature importance (Engineered)',
                borderColor: CHART_COLORS.blue,
                backgroundColor: transparentize(CHART_COLORS.blue, 0.2),
                borderWidth: 1
            };

            // Create bar chart for global engineered feature importance
            let globalEngineeredFIChart = createBarChart(engineeredGFIChartConfig);

            // Add reset zoom button
            $('#globalRawFIZoom').on('click', function (event) {
                event.preventDefault();
                resetZoom(globalRawFIChart);
            });

            $('#globalEngineeredFIZoom').on('click', function (event) {
                event.preventDefault();
                resetZoom(globalEngineeredFIChart);
            });

        }).then(param => {
            // After the chart is loaded, remove the loading screen and add the loaded content
            setVisible('#dashboard', true);
            setVisible('#loading-subpage', false);
        })
        .catch((error) => {
            // For debugging purposes
            console.error('Error:', error);
        });
}

// --------------------------------------------------------------------------
// Custom functions end
// --------------------------------------------------------------------------

export function load() {
    $(document).ready(function () {
        // Load the zoom plugins
        Chart.register(zoomPlugin);

        // Load the charts
        loadCharts();
    });
}

