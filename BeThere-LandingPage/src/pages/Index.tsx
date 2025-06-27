import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, MapPin, Users, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-bethere-50 to-bethere-100">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/Logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-semibold text-gray-900">BeThere.</span>
            </div>
            <Button 
              onClick={() => window.open('https://bethere-app.vercel.app/parties', '_blank')}
              className="bg-bethere-600 hover:bg-bethere-700 text-white px-6 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-bethere-600/25"
            >
              App öffnen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-bethere-500 to-bethere-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-bethere-600/25">
                <img src="/lovable-uploads/Logo.png" alt="Logo" className="w-24 h-24 object-contain rounded-3xl shadow-2xl shadow-bethere-600/25" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Deine Parties.
              <br />
              <span className="bg-gradient-to-r from-bethere-600 to-bethere-800 bg-clip-text text-transparent">
                Perfekt geplant.
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              BeThere macht es einfach, unvergessliche Events zu planen und deine Freunde zusammenzubringen. 
              Alles an einem Ort – von der Idee bis zur Party.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => window.open('https://bethere-app.vercel.app/parties', '_blank')}
                size="lg"
                className="bg-gradient-to-r from-bethere-600 to-bethere-700 hover:from-bethere-700 hover:to-bethere-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-bethere-600/30 hover:scale-105"
              >
                Jetzt starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-bethere-200 text-bethere-700 hover:bg-bethere-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
              >
                Demo ansehen
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Alles was du brauchst
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Von der Planung bis zur Durchführung – BeThere begleitet dich bei jedem Schritt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-bethere-500 to-bethere-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-bethere-600/20">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Event Planung</h3>
              <p className="text-gray-600 leading-relaxed">
                Erstelle Events mit allen wichtigen Details – Datum, Zeit, Ort und mehr. 
                Alles übersichtlich und einfach zu verwalten.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-bethere-500 to-bethere-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-bethere-600/20">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Gäste Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Lade Freunde ein, verwalte Zusagen und behalte den Überblick über alle Teilnehmer. 
                Kommunikation war nie einfacher.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-bethere-500 to-bethere-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-bethere-600/20">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Location Finder</h3>
              <p className="text-gray-600 leading-relaxed">
                Finde die perfekte Location mit integrierter Karte. 
                Von der Terrasse bis zum Club – alles ist möglich.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-bethere-600 to-bethere-800 bg-clip-text text-transparent">
                Einfach. Intuitiv. Schön.
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Entdecke, wie einfach Party-Planung sein kann. Von öffentlichen Events bis zu privaten Feiern.
            </p>
          </div>

          <div className="flex justify-center items-center space-x-8 lg:space-x-16">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-bethere-600 to-bethere-800 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-1 shadow-2xl">
                <img 
                  src="/lovable-uploads/b9a51156-33ae-48c9-b7bf-dcee9a89124f.png"
                  alt="BeThere App Screenshots"
                  className="w-full max-w-2xl rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-r from-bethere-600 to-bethere-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Bereit für deine nächste Party?
          </h2>
          <p className="text-xl text-bethere-100 mb-12 max-w-2xl mx-auto">
            Starte jetzt und erlebe, wie einfach es ist, unvergessliche Events zu planen.
          </p>
          <Button 
            onClick={() => window.open('https://bethere-app.vercel.app/parties', '_blank')}
            size="lg"
            className="bg-white text-bethere-700 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <Smartphone className="mr-2 h-5 w-5" />
            BeThere App öffnen
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-bethere-600 rounded-lg flex items-center justify-center">
            <img src="/lovable-uploads/Logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-semibold text-white">BeThere.</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 BeThere. Made with ❤️ for party lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
