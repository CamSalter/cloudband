//make a response object with a key for each metric type.
//john arn => arn:aws:iam::285264751894:role/CloudbandDelegationRole
//tomas arn => arn:aws:iam::499611886771:role/CloudbandDelegationRole
const {
  CloudWatchClient,
  GetMetricDataCommand,
} = require('@aws-sdk/client-cloudwatch');
const { ListInstancesCommand } = require('@aws-sdk/client-ec2');
//const cloudwatch = new AWS.CloudWatch({apiVersion: '2010-08-01'});

const getMetrics = async (req, res, next) => {
  console.log('Entered cloudwatch controller');
  const credentials = {
    region: 'us-east-1',
    credentials: res.locals.credentials,
  };
  const cloudwatch = new CloudWatchClient(credentials);

  try {
    const EndTime = new Date();
    //shows the EC2 CPU utilization of the past 7 days -> currently 0.3 days
    const StartTime = new Date(EndTime.getTime() - 1 * 24 * 60 * 60 * 1000);

    const { instances } = res.locals.ec2Instances; //[id1, id2, id3]
    //extract instance identifers from the list of instances
    console.log('instances', instances);

    const queries = instances.map((instanceId, index) => ({
      Id: `m${index + 1}`,
      Label: 'CPUUtilization',
      MetricStat: {
        Metric: {
          Namespace: 'AWS/EC2',
          MetricName: 'CPUUtilization',
          Dimensions: [
            {
              Name: 'InstanceId',
              Value: instanceId,
            },
          ],
        },
        Period: 3600,
        Stat: 'Average',
      },
      // },
    }));
    // {
    //   Id: `m${index + 2}`,
    //   Label: 'MemoryUtilization',
    //   MetricStat: {
    //     Metric: {
    //       Namespace: 'AWS/EC2',
    //       MetricName: 'MemoryUtilization',
    //       Dimensions: [
    //         {
    //           Name: 'InstanceId',
    //           Value: instanceId,
    //         },
    //       ],
    //     },
    //     Period: 3600,
    //     Stat: 'Average',
    //   },
    // },
    // {
    //   Id: `m${index + 3}`,
    //   Label: 'NetworkIn',
    //   MetricStat: {
    //     Metric: {
    //       Namespace: 'AWS/EC2',
    //       MetricName: 'NetworkIn',
    //       Dimensions: [
    //         {
    //           Name: 'InstanceId',
    //           Value: instanceId,
    //         },
    //       ],
    //     },
    //     Period: 3600,
    //     Stat: 'Sum',
    //   },
    // },
    // {
    //   Id: `m${index + 4}`,
    //   Label: 'NetworkOut',
    //   MetricStat: {
    //     Metric: {
    //       Namespace: 'AWS/EC2',
    //       MetricName: 'NetworkOut',
    //       Dimensions: [
    //         {
    //           Name: 'InstanceId',
    //           Value: instanceId,
    //         },
    //       ],
    //     },
    //     Period: 3600,
    //     Stat: 'Sum',
    //   },
    // },
    // {
    //   Id: `m${index + 5}`,
    //   Label: 'CPUCredits',
    //   MetricStat: {
    //     Metric: {
    //       Namespace: 'AWS/EC2',
    //       MetricName: 'CPUCredits',
    //       Dimensions: [
    //         {
    //           Name: 'InstanceId',
    //           Value: instanceId,
    //         },
    //       ],
    //     },
    //     Period: 3600,
    //     Stat: 'Sum',
    //   },
    // }

    const input = {
      StartTime,
      EndTime,
      LabelOptions: {
        Timezone: '-0400',
      },
      MetricDataQueries: queries,
    };
    const command = new GetMetricDataCommand(input);
    const responses = await cloudwatch.send(command);
    console.log('responses: ', responses);
    const values = responses.MetricDataResults.reduce((acc, curr) => {
      acc.push(curr.Values);
      return acc;
    }, []);
    // console.log('values', values);
    const timestamps = responses.MetricDataResults[0].Timestamps;
    // console.log('timestamps: ', timestamps);

    const chartData = {
      values: values, // [[...], [...], [...]] as many arrays as there are instances
      timestamps: timestamps, // [...] 1 array
      instanceIds: instances, // ['string', 'string', 'string'] as many strings as there are instances
    };

    res.locals.chartData = chartData;
    // console.log('res.locals.chartData: ', res.locals.chartData);
    return next();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  getMetrics,
};
