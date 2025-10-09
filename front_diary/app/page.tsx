import Image from "next/image";
import styles from './styles/pages/home.module.css';
import { Button } from "@/components/ui/button"
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <div>
        <h1 className="text-4xl m-5">Welcome to my diary app</h1>
      </div>

      <div className="flex h-18 w-screen items-center justify-center gap-4 ">

        <Button className="w-16 cursor-pointer" variant={"secondary"}>
          <a href="/routes/register">signup</a>
        </Button>

        <Button className="w-16 cursor-pointer" variant={"secondary"}>
          <a href="/routes/login">login</a>
        </Button>
      </div>

    </div>
  );
}
