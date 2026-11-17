"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { checkIsAdmin, checkSession } from "@/services/usuarioService";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [autorizado, setAutorizado] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function verificarAcesso() {
            try {
                const sessao = await checkSession();
                if (!ativo) return;
                if (!sessao) {
                    router.replace("/login");
                    return;
                }

                const admin = await checkIsAdmin();
                if (!ativo) return;
                if (!admin) {
                    router.replace("/dashboard");
                    return;
                }
                setAutorizado(true);
            } catch {
                if (ativo) setErro("Não foi possível verificar seu acesso. Atualize a página.");
            }
        }

        void verificarAcesso();
        return () => { ativo = false; };
    }, [router]);

    if (!autorizado) {
        return (
            <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 bg-[#F6F6F2] px-4 text-center">
                {erro ? (
                    <p role="alert" className="text-sm font-semibold text-red-600">{erro}</p>
                ) : (
                    <>
                        <LoaderCircle size={36} className="animate-spin text-yellow-600" />
                        <p className="text-sm text-neutral-500">Verificando acesso administrativo...</p>
                    </>
                )}
            </main>
        );
    }
    return <>{children}</>;
}
