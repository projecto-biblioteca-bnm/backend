import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#1a2233] text-white p-4 flex flex-col items-center text-xs">
      <div className="flex gap-4 mb-2">
        <a href="#" className="hover:text-gray-400 transition-colors" aria-label="WhatsApp">
          <FaWhatsapp size={20} />
        </a>
        <a href="#" className="hover:text-gray-400 transition-colors" aria-label="Instagram">
          <FaInstagram size={20} />
        </a>
        <a href="#" className="hover:text-gray-400 transition-colors" aria-label="Facebook">
          <FaFacebook size={20} />
        </a>
      </div>
      <div className="text-center">
        © 2025 Biblioteca Nacional de Moçambique. Todos os direitos reservados.<br />
        Desenvolvido com paixão pela leitura.
      </div>
    </footer>
  );
}
