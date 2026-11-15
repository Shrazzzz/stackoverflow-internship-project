
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "./button";
import { supabase } from "@/lib/supabaseClient";

const Navbar = ({ handleslidin }: any) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setUser(null);
    router.push("/login");
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-5 px-5 py-3">

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleslidin}>
            <Menu />
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Stack Overflow logo"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold text-gray-800">
              Stack Overflow
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-gray-600">
          <Link href="/about">About</Link>
          <Link href="/products">Products</Link>
          <Link href="/teams">For Teams</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center border rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="outline-none px-2 w-32"
            />
          </div>

          {!loading && (
            user ? (
              <>
                <Link
                  href="/profile"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg"
                >
                  Log in
                </Link>

                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Sign up
                </Link>
              </>
            )
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
