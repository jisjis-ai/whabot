import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../components/AuthProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'WhatsApp Pro - Marketing Profissional',
  description: 'Plataforma completa de marketing WhatsApp com IA, automação e campanhas avançadas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}