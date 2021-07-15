using CarDealershipWebApp.Models.Interfaces;
using CarDealershipWebApp.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace CarDealershipWebApp.Models
{
    public class Car : CarBluePrint
    {
        public int ID { get; set; }
        public int CarModelID { get; set; }
        public CarModel CarModel { get; set; }

        [Column("Aspiration")]
        public string Aspiration
        {
            get
            {
                return _aspiration;
            }
            set
            {
                if (AspirationTypeList.Contains(value))
                    _aspiration = value;
                else
                    throw new InvalidOperationException($"Invalid value. {value} does not exists.");
            }
        }
        private string _aspiration;

        [Column("Assembled")]
        public string Assembled
        {
            get
            {
                return _assembled;
            }
            set
            {
                if (AssembledTypeList.Contains(value))
                    _assembled = value;
                else
                    throw new InvalidOperationException($"Invalid value. {value} does not exists.");
            }
        }
        private string _assembled;

        public string Colour {
            get
            {
                if (_colour == null) return null;
                return _colour.Equals(" -") ? null : _colour;
            }
            set {
                if (value == null)
                    _colour = null;
                else
                    _colour = (value.Equals("none")) ? " -" : value;
            } 
        }
        private string _colour;

        [Column("DirectInjection")]
        public string DirectInjection
        {
            get
            {
                return _directInjection;
            }
            set
            {
                if (DirectInjectionList.Contains(value))
                    _directInjection = value;
                else
                    throw new InvalidOperationException($"Invalid value. {value} does not exists.");
            }
        }
        private string _directInjection;

        public int Doors { get; set; }

        public double EngineCC { get; set; }

        [Column("FuelType")]
        public string FuelType
        {
            get
            {
                return _fuel;
            }
            set
            {
                if (FuelTypeList.Contains(value))
                    _fuel = value;
                else
                    throw new InvalidOperationException($"Invalid value. {value} does not exists.");
            }
        }
        private string _fuel;

        public double HeightMM { get; set; }

        public double LengthMM { get; set; }

        public int ManufactureYear { get; set; }

        public double Mileage { get; set; }

        public double PeakPowerHP { get; set; }

        public double PeakTorqueNM { get; set; }

        [DataType(DataType.Currency)]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }

        [DataType(DataType.Currency)]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal PricePerMonth { get; set; }

        public int SeatCapacity { get; set; }

        [Column("SteeringType")]
        public string SteeringType
        {
            get
            {
                return _steeringType;
            }
            set
            {
                if (SteeringTypeList.Contains(value))
                    _steeringType = value;
                else
                    throw new InvalidOperationException($"Invalid value. {value} does not exists.");
            }
        }
        private string _steeringType;

        public string Title { get; set; }

        [Column("Transmission")]
        public string Transmission
        {
            get
            {
                return _tranmission;
            }
            set
            {
                if (TransmissionList.Contains(value))
                    _tranmission = value;
                else
                    throw new InvalidOperationException($"Invalid value. {value} does not exists.");
            }
        }
        private string _tranmission;

        public double WheelBaseMM { get; set; }

        public double WidthMM { get; set; }

        // Remaining attributes
        // car_images
        // registration_image
        // equipments_html
        // registration_details_html
        // seller_notes_html
        // specifications_html
    }
}
