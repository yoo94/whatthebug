// This file is the entry point of the application and contains the main logic written in vanilla JavaScript.

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    app.innerHTML = '<h1>Welcome to WhatTheBug!</h1>';
    
    // Main application logic goes here
    const button = document.createElement('button');
    button.textContent = 'Click me!';
    app.appendChild(button);

    button.addEventListener('click', () => {
        alert('Button clicked!');
    });
});