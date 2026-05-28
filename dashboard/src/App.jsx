import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import TerrariumScene from './components/TerrariumScene';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// React uygulamasından MQTT broker'a bağlanıp veri çekeceğimiz modül
import mqtt from 'mqtt';

function App() {
  const [sensorData, setSensorData] = useState({ temp: '--', humidity: '--', light: '--' });
  const [dataHistory, setDataHistory] = useState([]); // Grafikler için veri geçmişi
  
  // Aktüatörlerin açık/kapalı durumlarını tutacağımız state
  const [actuators, setActuators] = useState({
    heater: false,
    mist: false,
    uvlamp: false
  });

  useEffect(() => {
    // EMQX Public Broker WebSocket endpoint
    const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt'); 
    
    client.on('connect', () => {
      console.log('Buluta (MQTT) WebSocket ile bağlanıldı!');
      client.subscribe('terrarium/sensors/temperature');
      client.subscribe('terrarium/sensors/humidity');
      client.subscribe('terrarium/sensors/light');
    });
    
    client.on('message', (topic, message) => {
      try {
        const val = JSON.parse(message.toString());
        
        setSensorData(prev => {
          const newData = { ...prev };
          if(topic === 'terrarium/sensors/temperature' && val.temp !== undefined) newData.temp = val.temp;
          if(topic === 'terrarium/sensors/humidity' && val.humidity !== undefined) newData.humidity = val.humidity;
          if(topic === 'terrarium/sensors/light' && val.light !== undefined) newData.light = val.light;
          
          // Grafik için geçmişi güncelle (sıcaklık gelince senkronize ediyoruz)
          if(topic === 'terrarium/sensors/temperature') {
            setDataHistory(oldHistory => {
               const timestamp = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second:'2-digit' });
               const newPoint = { time: timestamp, temp: val.temp, humidity: newData.humidity === '--' ? 0 : newData.humidity };
               const newHist = [...oldHistory, newPoint];
               return newHist.slice(-20); // Sadece son 20 veriyi ekranda tut
            });
          }
          
          return newData;
        });
      } catch (e) {
        console.error("Data parse error:", e);
      }
    });

    // Global erişim için (butonlardan komut yollamak adına) client'ı window objesine kaydedebiliriz
    // Veya basitçe onClick içinde publish işlemi yapabiliriz. React state'i daha iyidir ama hızlıca global de tutabiliriz.
    window.mqttClient = client;

    return () => {
      client.end();
    };
  }, []);

  const handleActuator = (actuatorName) => {
    setActuators(prev => {
      const newState = !prev[actuatorName];
      const payload = newState ? "ON" : "OFF";
      
      if(window.mqttClient) {
        window.mqttClient.publish(`terrarium/control/${actuatorName}`, payload);
      }
      
      return { ...prev, [actuatorName]: newState };
    });
  };

  return (
    <div className="w-full h-screen p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f18] to-black text-white box-border font-sans overflow-hidden">
      
      {/* Left Panel: Dashboard ve Kontroller */}
      <div className="col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col gap-8 z-10">
        
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-green-300 to-teal-500 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
            🦎 Digital Twin
          </h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide text-sm uppercase">IoT Reptile Terrarium Control</p>
        </div>
        
        {/* Sensor Data Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Live Telemetry</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Temp Card */}
            <div className="col-span-2 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-5 rounded-2xl flex justify-between items-center relative overflow-hidden group hover:border-orange-500/40 transition-all">
               <div className="absolute -right-4 -top-4 text-orange-500/10 text-6xl group-hover:scale-110 transition-transform">🌡️</div>
               <span className="text-orange-200/80 font-medium z-10 text-lg">Temperature</span> 
               <span className="font-mono text-4xl font-bold text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] z-10">{sensorData.temp}<span className="text-2xl text-orange-500/50">°C</span></span>
            </div>

            {/* Humidity Card */}
            <div className="col-span-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-blue-500/40 transition-all">
               <span className="text-blue-200/80 font-medium z-10 text-sm">Humidity 💧</span> 
               <span className="font-mono text-3xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] z-10">{sensorData.humidity}<span className="text-lg text-cyan-500/50">%</span></span>
            </div>

            {/* Light Card */}
            <div className="col-span-1 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-yellow-500/40 transition-all">
               <span className="text-yellow-200/80 font-medium z-10 text-sm">Light/UV ☀️</span> 
               <span className="font-mono text-3xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] z-10">{sensorData.light}<span className="text-lg text-yellow-500/50">lx</span></span>
            </div>
          </div>
        </div>

        {/* Actuator Controls Section */}
        <div className="flex flex-col gap-4 mt-auto">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Manual Override</h3>
           <div className="flex flex-col gap-3">
             
             {/* Heater Switch */}
             <button onClick={() => handleActuator('heater')} className={`group flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 font-semibold border ${actuators.heater ? 'bg-red-500/20 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/10'}`}>
               <div className="flex items-center gap-3"><span className="text-xl">🔥</span><span>Heater</span></div>
               <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${actuators.heater ? 'bg-red-500' : 'bg-slate-700'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${actuators.heater ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
             </button>

             {/* Mister Switch */}
             <button onClick={() => handleActuator('mist')} className={`group flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 font-semibold border ${actuators.mist ? 'bg-blue-500/20 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-blue-500/5 text-blue-400 border-blue-500/20 hover:bg-blue-500/10'}`}>
               <div className="flex items-center gap-3"><span className="text-xl">💨</span><span>Mister</span></div>
               <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${actuators.mist ? 'bg-blue-500' : 'bg-slate-700'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${actuators.mist ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
             </button>

             {/* UV Lamp Switch */}
             <button onClick={() => handleActuator('uvlamp')} className={`group flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 font-semibold border ${actuators.uvlamp ? 'bg-purple-500/20 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-purple-500/5 text-purple-400 border-purple-500/20 hover:bg-purple-500/10'}`}>
               <div className="flex items-center gap-3"><span className="text-xl">🔮</span><span>UV Lamp</span></div>
               <div className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${actuators.uvlamp ? 'bg-purple-500' : 'bg-slate-700'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${actuators.uvlamp ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </div>
             </button>

           </div>
        </div>
      </div>
      
      {/* Center Panel: Digital Twin Render Area */}
      <div className="lg:col-span-2 bg-gradient-to-b from-[#0f172a] to-black rounded-3xl flex flex-col items-center justify-center border border-slate-800 shadow-2xl overflow-hidden relative group z-10">
        
        <div className="absolute top-6 left-6 text-slate-500 font-mono text-xs z-10 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Three.js / React-Three-Fiber Engine Live
        </div>
        
        {/* 3D Canvas Engine Area */}
        <Canvas shadows camera={{ position: [0, 2, 7], fov: 45 }}>
           <TerrariumScene sensorData={sensorData} />
        </Canvas>
      </div>

      {/* Right Panel: Analytics & Charts (NEW) */}
      <div className="col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col gap-6 z-10">
         <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/10 pb-4">System Analytics</h2>
         
         {/* Status Indicator */}
         <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
           <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
           <div className="flex flex-col">
             <span className="text-emerald-400 font-semibold text-sm">MQTT Network Online</span>
             <span className="text-slate-400 text-xs">Receiving CoAP streams</span>
           </div>
         </div>

         {/* Chart Area */}
         <div className="w-full h-[280px] mt-2">
            <h3 className="text-xs font-semibold text-slate-400 mb-4 ml-2">Temperature & Humidity Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 10}} tickMargin={10} />
                <YAxis yAxisId="left" stroke="#f97316" tick={{fontSize: 10}} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
         </div>
      </div>
      
    </div>
  )
}

export default App;
