const Express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const multer = require("multer");
const { exec } = require("child_process");
const XLSX = require('xlsx');
const app = Express();
app.use(cors());
app.use(bodyParser.json());

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const logDebug = (label, data) => {
    console.log(`${label}:`, data);
};

// Map columns from the Excel file
const mapColumns = {
    senderAccount: 'nameOrig',
    senderOldBalance: 'oldbalanceOrg',
    senderNewBalance: 'newbalanceOrig',
    receiverAccount: 'nameDest',
    receiverOldBalance: 'oldbalanceDest',
    receiverNewBalance: 'newbalanceDest',
    type: 'type',
    amount: 'amount',
    step: 'step'
};

// API to handle form submission and predict fraud
app.post("/predict", async (req, res) => {
    const formData = req.body;
    logDebug('formdata', formData);
    try {
        // Stringify the formData to pass as input to the Python script
        const inputData = JSON.stringify(formData);

        // Spawn a Python process to handle prediction
        const pythonProcess = exec(`py predict.py`, (error, stdout, stderr) => {
            if (error) {
                console.error("Error running Python script:", error);
                return res.status(500).json({ success: false, error: "Internal Server Error" });
            }

            try {
                // Parse the output from the Python script
                const output = JSON.parse(stdout);

                if (output.success) {
                    // Respond with the prediction
                    res.json({
                        success: true,
                        prediction: output.prediction
                    });
                } else {
                    res.status(500).json({ success: false, error: output.error });
                }
            } catch (parseError) {
                console.error("Error parsing Python script output:", parseError);
                res.status(500).json({ success: false, error: "Internal Server Error" });
            }
        });

        // Write the formData to the Python process stdin
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// API to handle Excel file upload and prediction
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded' });
    }

    try {
        logDebug('File Uploaded', req.file.originalname);

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0]; // Get the first row as headers
        logDebug('Excel Headers', headers);
        const mappedColumns = mapColumns;
        logDebug('Mapped Columns', mappedColumns);

        const data = XLSX.utils.sheet_to_json(worksheet, { header: '1' });
        const results = [];

        for (const row of data.slice(0)) { // Skip the header row
            logDebug('row', row);
            const formData = {
                senderAccount: row[mappedColumns.senderAccount],
                senderOldBalance: row[mappedColumns.senderOldBalance],
                senderNewBalance: row[mappedColumns.senderNewBalance],
                receiverAccount: row[mappedColumns.receiverAccount],
                receiverOldBalance: row[mappedColumns.receiverOldBalance],
                receiverNewBalance: row[mappedColumns.receiverNewBalance],
                type: row[mappedColumns.type],
                amount: row[mappedColumns.amount],
                step: row[mappedColumns.step]
            };

            logDebug('Processing Row', formData);

            const inputData = JSON.stringify(formData);

            // Call Python script to get predictions
            const prediction = await new Promise((resolve, reject) => {
                const pythonProcess = exec(`py predict.py`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error running Python script:', error);
                        return reject(error);
                    }
                    logDebug('Python Script Output', stdout);

                    try {
                        const output = JSON.parse(stdout);
                        resolve(output.prediction);
                    } catch (err) {
                        console.error('Error parsing Python script output:', err);
                        reject(err);
                    }
                });

                pythonProcess.stdin.write(inputData);
                pythonProcess.stdin.end();
            });

            logDebug('Prediction Result', prediction);

            // Add result to the list
            results.push({ ...formData, prediction });
        }

        logDebug('Final Results', results);

        // Return the predictions in JSON format for frontend rendering
        res.json({
            success: true,
            predictions: results
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Start server
app.listen(5038, () => {
    console.log("Server is listening on port 5038...");
});
