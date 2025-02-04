const { spawn } = require("child_process");
const path = require("path");

const runPythonScript = (username, no_of_tweets) => {  
    return new Promise((resolve, reject) => {  
        const scriptPath = path.resolve(__dirname, 'twiter_scraping.py');  
        console.log(`Running command: python ${scriptPath} ${username} ${no_of_tweets}`);

        const pythonProcess = spawn('python', [scriptPath, username, no_of_tweets.toString()]);  
        let outputData = '';  

        pythonProcess.stdout.on('data', (data) => {  
            outputData += data.toString();  
        });  

        pythonProcess.stderr.on('data', (data) => {  
            console.error(`Python Error: ${data.toString()}`);  
        });  

        pythonProcess.on('close', (code) => {  
            console.log(`Python process exited with code ${code}`);
            
            if (code !== 0) {  
                reject(new Error(`Python process exited with code ${code}`));  
                return;  
            }  

            try {  
                // console.log("Raw Python Output:", outputData);

                const jsonStart = outputData.indexOf('{');  
                const jsonEnd = outputData.lastIndexOf('}') + 1;  
                const jsonString = outputData.slice(jsonStart, jsonEnd).trim();  

                // console.log("Extracted JSON:", jsonString);

                resolve(JSON.parse(jsonString));  
            } catch (error) {  
                reject(new Error(`Failed to parse JSON: ${error.message}`));  
            }  
        });  
    });  
};  


module.exports = runPythonScript;











// const { spawn } = require("child_process");

// async function runPythonScript(username, count) {
//     return new Promise((resolve, reject) => {
//         const pythonProcess = spawn("python", ["src/scripts/scraper.py", username, count]);

//         let dataBuffer = "";

//         pythonProcess.stdout.on("data", (data) => {
//             dataBuffer += data.toString();
//         });

//         pythonProcess.stderr.on("data", (data) => {
//             console.error("Python error:", data.toString());
//         });

//         pythonProcess.on("close", (code) => {
//             try {
//                 const jsonData = JSON.parse(dataBuffer.trim());
//                 resolve(jsonData);
//             } catch (error) {
//                 console.error("Invalid JSON response from Python script:", dataBuffer);
//                 reject({ error: "Invalid JSON response from Python script" });
//             }
//         });
//     });
// }

// module.exports = runPythonScript;







