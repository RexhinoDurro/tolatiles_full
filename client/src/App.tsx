import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import FAQsPage from './pages/FAQsPage';
import ContactPage from './pages/ContactPage';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'services':
        return <ServicesPage />;
      case 'gallery':
        return <GalleryPage selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />;
      case 'about':
        return <AboutPage />;
      case 'faqs':
        return <FAQsPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        setSelectedCategory={setSelectedCategory} 
      />
      {renderCurrentPage()}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;