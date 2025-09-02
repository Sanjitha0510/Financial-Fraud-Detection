import React, { useState } from 'react';
import './Form.css';

const Upload = () => {
    const API_URL = 'http://65.0.71.198:5038'; // Replace with your actual EC2 public IP or DNS

    const [formData, setFormData] = useState({
        senderAccount: '',
        senderOldBalance: '',
        senderNewBalance: '',
        receiverAccount: '',
        receiverOldBalance: '',
        receiverNewBalance: '',
        type: '',
        amount: '',
        step: ''
    });

    const [file, setFile] = useState(null);
    const [predictionResults, setPredictionResults] = useState(null);
    const [error, setError] = useState(null);
    const [isFileUpload, setIsFileUpload] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === 'file') {
            setFile(e.target.files[0]);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleFileUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, { // Use API_URL here
            method: 'POST',
            body: formData
        });

        return response;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setPredictionResults(null);

        try {
            let response;

            if (isFileUpload && file) {
                response = await handleFileUpload();
            } else {
                response = await fetch(`${API_URL}/predict`, { // Use API_URL here
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (response.ok) {
                const data = await response.json();

                if (isFileUpload) {
                    setPredictionResults(data.predictions);
                } else {
                    setPredictionResults([{ ...formData, prediction: data.prediction }]);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to process transaction');
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    return (
        <div className="container">
            <form className="transaction-form" onSubmit={handleSubmit}>
                <h2>Upload Transaction Data</h2>

                {/* Toggle between form and file upload */}
                <div>
                    <label>
                        <input
                            type="radio"
                            name="inputMethod"
                            checked={!isFileUpload}
                            onChange={() => setIsFileUpload(false)}
                        />
                        Input Form
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="inputMethod"
                            checked={isFileUpload}
                            onChange={() => setIsFileUpload(true)}
                        />
                        Upload Excel File
                    </label>
                </div>

                {/* Conditional rendering of form or file input */}
                {!isFileUpload ? (
                    <>
                        {/* Sender's Details */}
                        <div className="form-section">
                            <h3>Sender's Details</h3>
                            <div className="input-group">
                                <div className="input-container">
                                    <label>Account No</label>
                                    <input
                                        type="text"
                                        name="senderAccount"
                                        value={formData.senderAccount}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="input-pair">
                                    <div className="input-container">
                                        <label>Old Balance</label>
                                        <input
                                            type="number"
                                            name="senderOldBalance"
                                            value={formData.senderOldBalance}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-container">
                                        <label>New Balance</label>
                                        <input
                                            type="number"
                                            name="senderNewBalance"
                                            value={formData.senderNewBalance}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Receiver's Details */}
                        <div className="form-section">
                            <h3>Receiver's Details</h3>
                            <div className="input-group">
                                <div className="input-container">
                                    <label>Account No</label>
                                    <input
                                        type="text"
                                        name="receiverAccount"
                                        value={formData.receiverAccount}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="input-pair">
                                    <div className="input-container">
                                        <label>Old Balance</label>
                                        <input
                                            type="number"
                                            name="receiverOldBalance"
                                            value={formData.receiverOldBalance}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-container">
                                        <label>New Balance</label>
                                        <input
                                            type="number"
                                            name="receiverNewBalance"
                                            value={formData.receiverNewBalance}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Type */}
                        <div className="form-section">
                            <h3>Transaction Type</h3>
                            <div className="input-group">
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="CASH_OUT"
                                            onChange={handleChange}
                                            required
                                        />
                                        CASH OUT
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="TRANSFER"
                                            onChange={handleChange}
                                            required
                                        />
                                        TRANSFER
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="PAYMENT"
                                            onChange={handleChange}
                                            required
                                        />
                                        PAYMENT
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="DEBIT"
                                            onChange={handleChange}
                                            required
                                        />
                                        DEBIT
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="CASH_IN"
                                            onChange={handleChange}
                                            required
                                        />
                                        CASH IN
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="form-section">
                            <h3>Transaction Details</h3>
                            <div className="input-group">
                                <div className="input-pair">
                                    <div className="input-container">
                                        <label>Amount</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-container">
                                        <label>Step</label>
                                        <input
                                            type="text"
                                            name="step"
                                            value={formData.step}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // File Upload Input
                    <div className="form-section">
                        <h3>Upload Excel File</h3>
                        <input
                            type="file"
                            name="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <button className="submit-btn" type="submit">Submit</button>

                {/* Display the prediction results in a table format */}
                {predictionResults && predictionResults.length > 0 && (
                    <div className="result-table">
                        <h3>Prediction Results</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sender Account</th>
                                    <th>Sender Old Balance</th>
                                    <th>Sender New Balance</th>
                                    <th>Receiver Account</th>
                                    <th>Receiver Old Balance</th>
                                    <th>Receiver New Balance</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Step</th>
                                    <th>Prediction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {predictionResults.map((result, index) => (
                                    <tr key={index}>
                                        <td>{result.senderAccount}</td>
                                        <td>{result.senderOldBalance}</td>
                                        <td>{result.senderNewBalance}</td>
                                        <td>{result.receiverAccount}</td>
                                        <td>{result.receiverOldBalance}</td>
                                        <td>{result.receiverNewBalance}</td>
                                        <td>{result.type}</td>
                                        <td>{result.amount}</td>
                                        <td>{result.step}</td>
                                        <td>{result.prediction === 1 ? 'Fraudulent' : 'Non-Fraudulent'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {error && (
                    <div className="error">
                        <h3>Error: {error}</h3>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Upload;
