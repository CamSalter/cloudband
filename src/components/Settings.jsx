import React from 'react';
import '../componentStyling/EC2Settings.scss';

const EC2Settings = (props) => {
  const { ec2Metric, setEc2Metric, tool, setTool, funcNames, setFuncNames } =
    props;

  const onEC2MetricChange = (event) => {
    setEc2Metric(event.target.value);
  };

  const onToolChange = (event) => {
    setTool(event.target.value);
  };

  function switchSettings() {
    if (tool === 'ec2') {
      return (
        <div className="settings-wrapper">
          <h2>EC2 Settings</h2>
          <label htmlFor="ec2-metrics">Choose a metric to view:</label>
          <section className="dropdown-wrapper">
            <select
              name="ec2-metrics"
              id="ec2-metrics"
              onChange={onEC2MetricChange}
              value={ec2Metric}
            >
              <option value="cpu-credits">CPU Credits</option>
              <option value="cpu-utilization">CPU Utilization</option>
              <option value="network-in-out">Network In/Out</option>
            </select>
          </section>
        </div>
      );
    } else if (tool === 'lambda') {
      return <div>Lambda function name selection goes here</div>;
    }
  }

  return (
    <div className="settings-wrapper">
      <label htmlFor="tool">Tool</label>
      <section className="dropdown-wrapper">
        <select name="tool" id="tool" onChange={onToolChange} value={tool}>
          <option value="ec2">EC2</option>
          <option value="lambda">Lambda</option>
        </select>
      </section>
      <div>{switchSettings()}</div>
    </div>
  );
};

export default EC2Settings;
