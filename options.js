<!DOCTYPE html>
<html>
<head>
    <title>ClarityPro Settings</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"] { width: 400px; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 10px 20px; background-color: #4A90E2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #3b73b8; }
        #status-message { margin-top: 15px; font-weight: bold; }
    </style>
</head>
<body>
    <h1>ClarityPro Settings</h1>
    <p>Enter your Google Gemini API Key below to enable AI features.</p>

    <label for="api-key-input">Gemini API Key:</label>
    <input type="text" id="api-key-input" placeholder="AIzaSyC...TsQ4">

    <button id="save-key">Save API Key</button>

    <div id="status-message"></div>

    <script src="options.js"></script>
</body>
</html>
