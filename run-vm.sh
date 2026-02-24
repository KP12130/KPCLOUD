#!/bin/bash

# KPCloud Linux Startup Script
echo "Starting KPCloud Grid (Server + Client) for VM Access..."

# Get the IP address
IP_ADDR=$(hostname -I | awk '{print $1}')

echo "Client Access: http://$IP_ADDR:5173"
echo "Server API: http://$IP_ADDR:5000"
echo ""

# Start the Node.js server
npm start
