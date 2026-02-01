// Question templates for each game mode

/**
 * Each template contains:
 * - id: unique string
 * - title: mission title
 * - type: 'code' or 'mcq'
 * - generate: function() -> { mission, dataInject, answer?, choices?, correctIndex? }
 *
 * For code missions, the generate() should return an object with:
 * { mission: string, dataInject: function(dataset) -> void, check: function(commands, dataset) -> boolean }
 *
 * For MCQ missions, generate() returns:
 * { mission: string, choices: string[], correctIndex: number }
 */

export const continuousTemplates = [
  {
    id: 'cont1',
    title: 'Summarize BMI',
    type: 'code',
    generate() {
      return {
        mission: 'Compute summary statistics for the BMI variable using the summarize command with the detail option.',
        dataInject(dataset) {
          // dataset has bmi; nothing else needed
        },
        check(commands) {
          // Accept summarize bmi, detail (with or without comma spacing)
          return commands.some((cmd) => /summarize\s+bmi\s*,?\s*detail/.test(cmd.toLowerCase()));
        }
      };
    }
  },
  {
    id: 'cont2',
    title: 'Box Plot of Length of Stay',
    type: 'code',
    generate() {
      return {
        mission: 'Create a box plot for the length of stay (los) variable.',
        dataInject(dataset) {
          // dataset has los; nothing to inject
        },
        check(commands) {
          return commands.some((cmd) => /graph\s+box\s+los/.test(cmd.toLowerCase()));
        }
      };
    }
  }
  ,
  {
    id: 'cont3',
    title: 'Histogram of BMI',
    type: 'code',
    generate() {
      return {
        mission: 'Create a histogram of the BMI variable.',
        dataInject(dataset) {
          // no special injection required
        },
        check(commands) {
          return commands.some((cmd) => /histogram\s+bmi/.test(cmd.toLowerCase()));
        }
      };
    }
  },
  {
    id: 'cont4',
    title: 'Mean BMI by Region',
    type: 'code',
    generate() {
      return {
        mission: 'Compute the mean BMI by region and store it in a variable mean_bmi_region (use egen or collapse).',
        dataInject(dataset) {},
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            // Accept egen mean or collapse
            return (
              /egen\s+mean_bmi_region\s*=\s*mean\(\s*bmi\s*\)\s*,?\s*by\(region\)/.test(c) ||
              /collapse\s+\(mean\)\s+bmi\s+.*by\s+region/.test(c)
            );
          });
        }
      };
    }
  },
  {
    id: 'cont5',
    title: 'Linear Regression of BMI on Age and Sex',
    type: 'code',
    generate() {
      return {
        mission: 'Fit a linear regression model with BMI as the outcome and age and sex as predictors.',
        dataInject(dataset) {},
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /regress\s+bmi/.test(c) && /age/.test(c) && /sex/.test(c);
          });
        }
      };
    }
  }
];

export const binaryTemplates = [
  {
    id: 'bin1',
    title: 'Logistic Regression for Mortality',
    type: 'code',
    generate() {
      return {
        mission: 'Fit a logistic regression model for the outcome mortality (mortality) using age and sex as predictors. Display odds ratios.',
        dataInject(dataset) {
          // dataset has mortality, age, sex
        },
        check(commands) {
          // Accept logistic or logit with mortality age i.sex and option or
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return (
              (/^(logistic|logit)/.test(c) && /mortality/.test(c) && /age/.test(c) && /sex/.test(c)) ||
              (/^(logistic|logit)/.test(c) && /i\.sex/.test(c))
            );
          });
        }
      };
    }
  }
  ,
  {
    id: 'bin2',
    title: 'Tabulate Mortality by Sex',
    type: 'code',
    generate() {
      return {
        mission: 'Create a two-way table of mortality by sex with either row or column percentages.',
        dataInject(dataset) {},
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /tabulate\s+mortality\s+sex/.test(c) && /(row|col)/.test(c);
          });
        }
      };
    }
  },
  {
    id: 'bin3',
    title: 'Logistic Regression with BMI',
    type: 'code',
    generate() {
      return {
        mission: 'Fit a logistic regression model for mortality on BMI, age and sex. Show odds ratios.',
        dataInject(dataset) {},
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return (/^(logistic|logit)/.test(c) && /mortality/.test(c) && /bmi/.test(c) && /age/.test(c) && /sex/.test(c));
          });
        }
      };
    }
  },
  {
    id: 'bin4',
    title: 'Interpret BMI Odds Ratio',
    type: 'mcq',
    generate() {
      return {
        mission: 'If the odds ratio for BMI in a logistic regression model predicting mortality is 1.10, how should you interpret this?',
        choices: [
          'Each one-unit increase in BMI multiplies the odds of mortality by 1.10',
          'BMI is not associated with mortality',
          'Each one-unit increase in BMI multiplies the odds of mortality by 0.10',
          'BMI reduces the odds of mortality by 10%'
        ],
        correctIndex: 0
      };
    }
  }
];

export const countTemplates = [
  {
    id: 'cnt1',
    title: 'Poisson Regression for Visits',
    type: 'code',
    generate() {
      return {
        mission: 'Fit a Poisson regression model for the number of visits in 12 months (visits_12mo) using age and sex as predictors.',
        dataInject(dataset) {
          // dataset has visits_12mo, age, sex
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /poisson/.test(c) && /visits_12mo/.test(c) && /age/.test(c) && /sex/.test(c);
          });
        }
      };
    }
  }
  ,
  {
    id: 'cnt2',
    title: 'Negative Binomial Regression for Visits',
    type: 'code',
    generate() {
      return {
        mission: 'Fit a negative binomial regression model for visits_12mo using age and sex as predictors.',
        dataInject(dataset) {},
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /nbreg/.test(c) && /visits_12mo/.test(c) && /age/.test(c) && /sex/.test(c);
          });
        }
      };
    }
  },
  {
    id: 'cnt3',
    title: 'Total Visits by Region',
    type: 'code',
    generate() {
      return {
        mission: 'Compute the total number of visits in 12 months for each region.',
        dataInject(dataset) {},
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            // Accept collapse (sum) visits_12mo, by(region) or egen total
            return (
              /collapse\s+\(sum\)\s+visits_12mo.*by\s+region/.test(c) ||
              /egen\s+.*=\s*total\(visits_12mo\).*by\(region\)/.test(c)
            );
          });
        }
      };
    }
  },
  {
    id: 'cnt4',
    title: 'Interpretation of IRR',
    type: 'mcq',
    generate() {
      return {
        mission: 'If the incidence rate ratio (IRR) for age in a Poisson model is 1.05, what does this mean?',
        choices: [
          'Each additional year of age increases the expected count by 5%',
          'Age is not associated with the count outcome',
          'Each additional year of age decreases the expected count by 5%',
          'The IRR cannot be interpreted'
        ],
        correctIndex: 0
      };
    }
  }
];

export const cleaningTemplates = [
  {
    id: 'clean1',
    title: 'Drop Missing Age/BMI',
    type: 'code',
    generate() {
      return {
        mission: 'There are missing values in variables age and bmi. Drop observations that have missing age or missing bmi.',
        dataInject(dataset) {
          // Introduce some missingness for demonstration
          const n = dataset.length;
          for (let i = 0; i < n; i++) {
            if (Math.random() < 0.05) dataset[i].age = null;
            if (Math.random() < 0.05) dataset[i].bmi = null;
          }
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /drop\s+if\s+.*missing\(age\).*\|.*missing\(bmi\)/.test(c);
          });
        }
      };
    }
  },
  {
    id: 'clean2',
    title: 'Report Missing Values',
    type: 'code',
    generate() {
      return {
        mission: 'Count how many observations have missing values for age or bmi.',
        dataInject(dataset) {
          // Introduce missingness
          const n = dataset.length;
          for (let i = 0; i < n; i++) {
            if (Math.random() < 0.05) dataset[i].age = null;
            if (Math.random() < 0.05) dataset[i].bmi = null;
          }
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /count\s+if\s+.*missing\(age\).*\|.*missing\(bmi\)/.test(c);
          });
        }
      };
    }
  },
  {
    id: 'clean3',
    title: 'Identify Duplicates',
    type: 'code',
    generate() {
      return {
        mission: 'Identify duplicate patient IDs in the dataset.',
        dataInject(dataset) {
          // Introduce duplicate id for demonstration
          if (dataset.length > 5) {
            dataset[dataset.length - 1].patient_id = dataset[0].patient_id;
          }
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            return /duplicates\s+report\s+patient_id/.test(c);
          });
        }
      };
    }
  }
  ,
  {
    id: 'clean4',
    title: 'Remove Unrealistic BMI Values',
    type: 'code',
    generate() {
      return {
        mission: 'Drop observations with BMI less than 10 or greater than 60.',
        dataInject(dataset) {},
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            // Accept drop if bmi < 10 | bmi > 60, with or without parentheses
            return /drop\s+if\s+(bmi\s*<\s*10\s*\|\s*bmi\s*>\s*60)/.test(c) || /drop\s+if\s+bmi\s*<\s*10\s*\|\|\s*bmi\s*>\s*60/.test(c);
          });
        }
      };
    }
  },
  {
    id: 'clean5',
    title: 'Convert BMI String to Numeric',
    type: 'code',
    generate() {
      return {
        mission: 'Convert the BMI variable from string to numeric, creating a new variable if necessary.',
        dataInject(dataset) {
          // Convert some BMI values to string to simulate messy data
          dataset.forEach((row) => {
            if (Math.random() < 0.1) row.bmi = row.bmi.toString();
          });
        },
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            // Accept destring bmi, generate(newvar) or destring bmi, replace
            return /destring\s+bmi/.test(c);
          });
        }
      };
    }
  },
  {
    id: 'clean6',
    title: 'Date Conversion',
    type: 'code',
    generate() {
      return {
        mission: 'Assume there is a variable visit_date in day-month-year string format. Convert visit_date to a Stata date variable named visit_date_stata.',
        dataInject(dataset) {},
        check(commands) {
          return commands.some((cmd) => {
            const c = cmd.toLowerCase();
            // Accept gen visit_date_stata = date(visit_date, "DMY") or similar with dmy
            return /gen(erate)?\s+visit_date_stata\s*=\s*date\(\s*visit_date\s*,\s*"?dmy"?\s*\)/.test(c);
          });
        }
      };
    }
  }
];

export const assumptionsTemplates = [
  {
    id: 'assump1',
    title: 'Normality Check',
    type: 'mcq',
    generate() {
      return {
        mission: 'Which Stata command is used to produce a Q-Q plot of residuals to check normality after a regression?',
        choices: ['qnorm', 'rvfplot', 'hettest', 'vif'],
        correctIndex: 0
      };
    }
  },
  {
    id: 'assump2',
    title: 'Heteroscedasticity Test',
    type: 'mcq',
    generate() {
      return {
        mission: 'After fitting a linear regression, which command tests for heteroscedasticity?',
        choices: ['swilk', 'hettest', 'estat gof', 'linktest'],
        correctIndex: 1
      };
    }
  },
  {
    id: 'assump3',
    title: 'Overdispersion in Counts',
    type: 'mcq',
    generate() {
      return {
        mission: 'If a Poisson model for count data shows overdispersion, which alternative model is recommended?',
        choices: ['regress', 'logit', 'nbreg', 'poisson'],
        correctIndex: 2
      };
    }
  }
  ,
  {
    id: 'assump4',
    title: 'Logistic Model Goodness-of-Fit',
    type: 'mcq',
    generate() {
      return {
        mission: 'Which Stata command can be used to assess the goodness-of-fit of a logistic regression model?',
        choices: ['estat gof', 'linktest', 'lrtest', 'swilk'],
        correctIndex: 0
      };
    }
  },
  {
    id: 'assump5',
    title: 'Multicollinearity Check',
    type: 'mcq',
    generate() {
      return {
        mission: 'After fitting a linear regression, which command checks for multicollinearity among predictors?',
        choices: ['vif', 'rvfplot', 'hettest', 'testparm'],
        correctIndex: 0
      };
    }
  }
];