# 🦎 IoT Reptile Terrarium Simulation & Digital Twin

This project designs a smart IoT-based terrarium system for monitoring and controlling environmental conditions required for reptile health. A network of low-power sensor and actuator nodes communicates over an IPv6-based wireless mesh to maintain optimal temperature, humidity, and lighting. 

The system integrates a **Digital Twin** in simulation to visualize and analyze the habitat in real time. A comprehensive dashboard enables remote monitoring, control, and alert management as if it were a real deployed product.

## 🌟 Key Features

* **Real-time Monitoring:** Monitor temperature, humidity, and light conditions in real time.
* **Automatic & Manual Control:** Control actuators (heater, UV lamp, mist system) via remote commands.
* **Low-power Network:** Implement a low-power IPv6-based IoT network using RPL routing.
* **Lightweight Protocols:** Use CoAP and MQTT for efficient, low-bandwidth data transfer.
* **3D Digital Twin:** A virtual representation of the terrarium state rendered in real-time.
* **Comprehensive Dashboard:** A responsive web dashboard for visualization and remote control.

## 🛠️ Technology Stack

* **IEEE 802.15.4** – Low-power wireless communication between nodes
* **6LoWPAN** – Enables compressed IPv6 over constrained networks
* **RPL** – Mesh routing between sensor and actuator nodes
* **CoAP** – Lightweight UDP-based communication for sensor data and control
* **Contiki-NG & Cooja** – Embedded OS for node implementation and network simulation
* **MQTT** – Communication bridge between the CoAP gateway and the web dashboard
* **React & Three.js (React Three Fiber)** – Frontend framework for the dashboard and 3D Digital Twin rendering
* **Tailwind CSS & Recharts** – UI styling and real-time data visualization

## 📂 Project Structure

* `/nodes` - Contains the C code for Contiki-NG IoT motes (Temperature, Humidity/Light, Actuators).
* `/gateway` - Python script (`coap_mqtt_bridge.py`) acting as a Border Router gateway, translating CoAP to MQTT.
* `/dashboard` - React application containing the UI, charts, and the 3D Terrarium Scene.

## 🚀 How to Run

1. **Start the Network (Cooja):**
   * Compile the nodes in Contiki-NG and start the Cooja simulation.
   * Start the `tunslip6` tunnel to bridge the simulation with your local machine.
2. **Start the Gateway:**
   * Run the Python bridge: `python3 gateway/bridge/coap_mqtt_bridge.py`
3. **Start the Dashboard:**
   * Navigate to `/dashboard`
   * Run `npm install` followed by `npm run dev`


