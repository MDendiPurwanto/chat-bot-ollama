import React, { useState } from 'react';

function AdvancedSettings({ 
  onSettingsChange, 
  availableModels 
}) {
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);
  const [selectedModel, setSelectedModel] = useState(availableModels[0]);

  const handleSubmit = () => {
    onSettingsChange({
      temperature,
      maxTokens,
      model: selectedModel
    });
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Pengaturan Lanjutan</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Model
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
        >
          {availableModels.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Kreativitas (Temperature): {temperature}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Panjang Maksimal Jawaban: {maxTokens} token
        </label>
        <input
          type="range"
          min="50"
          max="500"
          step="50"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        Terapkan Pengaturan
      </button>
    </div>
  );
}

export default AdvancedSettings;
