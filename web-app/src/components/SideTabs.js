import React, { useState } from 'react';
import './Sidebar.css'; // สร้างไฟล์ CSS สำหรับ Sidebar

const SideTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  return (
    <div className="side-tabs">
      <div className="tab-list">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={tab.name === activeTab ? 'active' : ''}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs.map(tab => (
          tab.name === activeTab && (
            <div key={tab.name} className="content">
              {tab.content}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default SideTabs;