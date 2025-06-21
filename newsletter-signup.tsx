import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, Facebook, Twitter, Github, Shield } from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Logo/Brand Mark */}
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>

          {/* Headlines */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Subscribe to Pulse</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Get the latest insights, tips, and exclusive content delivered straight to your inbox every week.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Sign-up Options */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-50">
                <Facebook className="w-4 h-4 text-blue-600" />
              </Button>
              <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-50">
                <Twitter className="w-4 h-4 text-sky-500" />
              </Button>
              <Button variant="outline" className="bg-white border-gray-200 hover:bg-gray-50">
                <Github className="w-4 h-4 text-gray-900" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <Button className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium">
              Subscribe Now
            </Button>
          </div>

          {/* Additional Links */}
          <div className="flex justify-center space-x-4 text-xs">
            <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">
              Terms
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">
              Privacy
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-gray-500 hover:text-purple-600 transition-colors">
              Help
            </a>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {/* Trust Indicators */}
          <div className="w-full text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>We respect your privacy. Unsubscribe at any time.</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
