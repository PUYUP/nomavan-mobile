export const SignalMeters = {
  "assumptions": {
    "signal_type": "RSRP",
    "unit": "dBm",
    "best_signal": -75,
    "worst_signal": -115,
    "total_range_db": 40,
    "distribution": "linear_per_bar"
  },

  "bars_3": {
    "max_bars": 3,
    "range_per_bar_db": 13.33,
    "bars": [
      { "bar": 3, "min_dbm": -88.33, "max_dbm": -75 },
      { "bar": 2, "min_dbm": -101.67, "max_dbm": -88.33 },
      { "bar": 1, "min_dbm": -115, "max_dbm": -101.67 }
    ]
  },

  "bars_4": {
    "max_bars": 4,
    "range_per_bar_db": 10,
    "bars": [
      { "bar": 4, "min_dbm": -85, "max_dbm": -75 },
      { "bar": 3, "min_dbm": -95, "max_dbm": -85 },
      { "bar": 2, "min_dbm": -105, "max_dbm": -95 },
      { "bar": 1, "min_dbm": -115, "max_dbm": -105 }
    ]
  },

  "bars_5": {
    "max_bars": 5,
    "range_per_bar_db": 8,
    "bars": [
      { "bar": 5, "min_dbm": -83, "max_dbm": -75 },
      { "bar": 4, "min_dbm": -91, "max_dbm": -83 },
      { "bar": 3, "min_dbm": -99, "max_dbm": -91 },
      { "bar": 2, "min_dbm": -107, "max_dbm": -99 },
      { "bar": 1, "min_dbm": -115, "max_dbm": -107 }
    ]
  },

  "bars_6": {
    "max_bars": 6,
    "range_per_bar_db": 6.67,
    "bars": [
      { "bar": 6, "min_dbm": -81.67, "max_dbm": -75 },
      { "bar": 5, "min_dbm": -88.33, "max_dbm": -81.67 },
      { "bar": 4, "min_dbm": -95, "max_dbm": -88.33 },
      { "bar": 3, "min_dbm": -101.67, "max_dbm": -95 },
      { "bar": 2, "min_dbm": -108.33, "max_dbm": -101.67 },
      { "bar": 1, "min_dbm": -115, "max_dbm": -108.33 }
    ]
  }
}