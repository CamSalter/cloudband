import React, { useState } from 'react';
import axios from 'axios';
import '../componentStyling/InputToken.scss';
//import AWS SDK
const AWS = require('aws-sdk');
//set the region
AWS.config.update({ region: 'REGION' });

const InputToken = (props) => {
  const { setChartData } = props;
  const [accessKey, setAccessKey] = useState();
  const [secretKey, setSecretKey] = useState();

  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log(accessKey);
    // console.log(secretKey);
    axios
      .get('http://localhost:3000/test', {
        params: {
          accessKey,
          secretKey,
        },
      })
      .then((response) => {
        // console.log('request response: ', response);
        setChartData(response.data);
      });
  };

  return (
    <div className="input-token-wrapper">
      <h2>Connect to Your Account</h2>
      <form action="" className="token-input-form">
        <span>Input Your Details Here:</span>
        <label className="access-key-label">Enter Access Key</label>
        <input
          type="password"
          placeholder="access key"
          id="accessKey"
          onChange={(e) => {
            setAccessKey(e.target.value);
            // console.log('access key: ', accessKey);;
          }}
        />
        <label className="secret-access-key-label">
          Enter Secret Access Key
        </label>
        <input
          type="password"
          placeholder="secret access key"
          id="secretKey"
          onChange={(e) => {
            setSecretKey(e.target.value);
            // console.log('secret key: ', secretKey);;
          }}
        />

        <button id="credentials-button" onClick={handleSubmit}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default InputToken;
