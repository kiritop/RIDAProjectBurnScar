import { useState } from 'react';
import './Sidebar.css'; // สร้างไฟล์ CSS สำหรับ Sidebar

function SideTab() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button onClick={toggleSidebar} style={{ position: 'absolute', zIndex: 1000 }}>
        Toggle Sidebar
      </button>
      {isOpen && (
        <div className="sidebar" style={{ right: 0 }}>
          {/* Insert your sidebar content here */}
        </div>
      )}
    </>
  );
}

export default SideTab;