import { CircleUser, Ticket } from "lucide-react";
import Link from "next/link";
import React from "react";

const Header = () => {
    return (
        <div className="flex justify-between items-center px-20 py-6 bg-white">
            <Link href={"/"}>
                <Ticket className="w-10 h-10" color="#2596be" />
            </Link>
            <div className="flex items-center gap-5">
                <h1 className="text-base hidden md:block">User</h1>
                <Link href={"/history"}>History</Link>
            </div>
        </div>
    );
};

export default Header;
