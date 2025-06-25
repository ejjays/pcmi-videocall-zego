"use client"

import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"
import { Search, Phone, Video, Plus } from "lucide-react"

export default function ContactsScreen() {
  const contacts = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "online" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "offline" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "busy" },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", status: "online" },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark animate-fadeIn">
      <Header title="Contacts" />

      <main className="px-4 py-6 pb-24">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-white placeholder-slate-400 transition-all duration-200"
          />
        </div>

        {/* Add Contact Button */}
        <button className="w-full bg-gradient-primary text-white font-medium py-3 px-4 rounded-xl mb-6 flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation shadow-lg hover:shadow-xl">
          <Plus className="w-5 h-5 mr-2" />
          Add Contact
        </button>

        {/* Contacts List */}
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="card-interactive p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-medium">
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        contact.status === "online"
                          ? "bg-green-500"
                          : contact.status === "busy"
                            ? "bg-red-500"
                            : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{contact.name}</h3>
                    <p className="text-sm text-dark-300">{contact.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-xl hover:bg-dark-700/50 transition-colors duration-200 touch-manipulation">
                    <Phone className="w-5 h-5 text-dark-300" />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-dark-700/50 transition-colors duration-200 touch-manipulation">
                    <Video className="w-5 h-5 text-dark-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
