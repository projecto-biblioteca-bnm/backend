'use client';

import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const ContactosPage = () => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Contacte-nos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Informação de Contacto</h2>
            <div className="flex items-start space-x-4 text-gray-600 mb-4">
              <FaMapMarkerAlt className="text-blue-500 mt-1 h-5 w-5 flex-shrink-0" />
              <span>
                <strong>Endereço:</strong><br />
                Av. 25 de Setembro, nr. 134, Maputo, Moçambique
              </span>
            </div>
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <FaPhone className="text-blue-500 h-5 w-5" />
              <span>
                <strong>Telefone:</strong> +258 21 301 000
              </span>
            </div>
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <FaEnvelope className="text-blue-500 h-5 w-5" />
              <span>
                <strong>Email:</strong> info.bnm@bnm.gov.mz
              </span>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Horário de Funcionamento</h2>
            <div className="flex items-start space-x-4 text-gray-600">
              <FaClock className="text-blue-500 mt-1 h-5 w-5 flex-shrink-0" />
              <span>
                <strong>Segunda a Sexta:</strong> 08:00 - 16:00<br />
                <strong>Sábados, Domingos e Feriados:</strong> Fechado
              </span>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="h-80 md:h-full w-full rounded-lg overflow-hidden shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3587.420623348612!2d32.5774700754092!3d-25.95436697723497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69a4e4f6d4d1b%3A0x86bb489241e1f1f2!2sBiblioteca%20Nacional%20de%20Mo%C3%A7ambique!5e0!3m2!1sen!2sus!4v1689280854492!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        
      </div>
    </div>
  );
};

export default ContactosPage;