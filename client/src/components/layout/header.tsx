import { Wifi, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-green-400 glitch-text" data-text="CyberPath">
              CyberPath
            </div>
            <div className="text-sm text-gray-400 font-mono">
              [<span className="text-green-400">SECURE</span>] Learning Platform v2.1.0
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Wifi className="h-4 w-4 text-green-400" />
              <span className="text-gray-400">Connected</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-400">user@cyberpath</span>
            </div>
            <Button className="bg-green-400 text-black hover:bg-green-500">
              <i className="fas fa-user"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
