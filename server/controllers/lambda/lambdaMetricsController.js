const {
  CloudWatchClient,
  GetMetricDataCommand,
} = require('@aws-sdk/client-cloudwatch');

const getMetricsLambdaFuncs = async (req, res, next) => {
  const credentials = {
    region: 'us-east-1',
    credentials: res.locals.credentials,
  };
  const cloudwatch = new CloudWatchClient(credentials);
  const EndTime = new Date();
  const StartTime = new Date(EndTime.getTime() - 0.3 * 24 * 60 * 60 * 1000);
  //   console.log('start time', StartTime);
  //   console.log('end time', EndTime);
  const { funcs } = res.locals;
  //   console.log('funcs', funcs);
  //   const { metricName } = req.query.metricName;
  const metricName = 'Invocations';

  const queries = funcs.map((func, index) => ({
    Id: `m${index + 1}`,
    Label: `Lambda Function ${func} ${metricName}`,
    MetricStat: {
      Metric: {
        Namespace: 'AWS/Lambda',
        MetricName: `${metricName}`,
        Dimensions: [
          {
            Name: 'FunctionName',
            Value: `${func}`,
          },
        ],
      },
      Period: 60,
      Stat: 'Sum',
    },
  }));
  const input = {
    StartTime,
    EndTime,
    LabelOptions: {
      Timezone: '-0400',
    },
    MetricDataQueries: queries,
  };

  try {
    const command = new GetMetricDataCommand(input);
    const metricData = await cloudwatch.send(command);

    const metricByFuncData = metricData.MetricDataResults.map(
      (eachFuncMetric) => {
        let values = eachFuncMetric.Values;
        let funcMetrics = eachFuncMetric.Timestamps.map((time, index) => {
          return {
            x: time,
            y: values[index],
          };
          //this returns [ { x: 2023-01-19T21:30:00.000Z, y: 76 },{ x: 2023-01-19T20:12:00.000Z, y: 41 } ]
        });
        console.log('funcMetrics', funcMetrics);
        return {
          name: eachFuncMetric.Label,
          data: funcMetrics,
        };
      }
    );
    /* metricByFuncData returns
    [{name: 'Lambda Function return-200-code Invocations', data: [ [{ x: 2023-01-19T21:30:00.000Z, y: 76 },{ x: 2023-01-19T20:12:00.000Z, y: 41 }],
    */

    console.log('metricByFuncData', metricByFuncData);

    const chartData = {
      metricData: metricByFuncData,
      instanceIds: funcs,
    };

    res.locals.chartData = chartData;
    return next();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  getMetricsLambdaFuncs,
};
