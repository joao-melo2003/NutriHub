"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  UserRound,
  UserRoundPen,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
} from "lucide-react";
import {
  checkSession,
  checkIsAdmin,
  logout,
} from "@/services/usuarioService";

type LinkNavegacao = {
  nome: string;
  rota: string;
};

const links: LinkNavegacao[] = [
  { nome: "Início", rota: "/" },
  { nome: "Dieta", rota: "/dieta-dash" },
  { nome: "Treinos", rota: "/treinos-dash" },
  { nome: "Rotina", rota: "/rotina-dash" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [autenticado, setAutenticado] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [verificando, setVerificando] = useState(true);

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [modalLogoutAberto, setModalLogoutAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erroLogout, setErroLogout] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      setVerificando(true);

      try {
        const possuiSessao = await checkSession();
        if (!ativo) return;

        setAutenticado(possuiSessao);

        if (!possuiSessao) {
          setIsAdmin(false);
          setDropdownAberto(false);
          return;
        }

        const administrador = await checkIsAdmin();
        if (!ativo) return;
        setIsAdmin(administrador);
      } catch {
        if (ativo) {
          setAutenticado(false);
          setIsAdmin(false);
          setDropdownAberto(false);
        }
      } finally {
        if (ativo) setVerificando(false);
      }
    }

    void verificarSessao();

    return () => {
      ativo = false;
    };
  }, [pathname]);

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  useEffect(() => {
    function fecharComEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setDropdownAberto(false);
      setMenuMobileAberto(false);
      if (!saindo) setModalLogoutAberto(false);
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [saindo]);

  function navegar(rota: string) {
    setDropdownAberto(false);
    setMenuMobileAberto(false);
    router.push(rota);
  }

  function abrirModalLogout() {
    setDropdownAberto(false);
    setMenuMobileAberto(false);
    setErroLogout("");
    setModalLogoutAberto(true);
  }

  async function handleLogout() {
    if (saindo) return;

    setSaindo(true);
    setErroLogout("");

    try {
      await logout();

      setAutenticado(false);
      setIsAdmin(false);
      setDropdownAberto(false);
      setModalLogoutAberto(false);

      router.replace("/");
      router.refresh();
    } catch (error) {
      setErroLogout(
        error instanceof Error
          ? error.message
          : "Não foi possível encerrar sua sessão."
      );
    } finally {
      setSaindo(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <nav className="relative mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => navegar("/")}
            aria-label="Ir para o início do NutriHub"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 transition-colors hover:bg-yellow-300">
              <Activity size={25} strokeWidth={2.5} className="text-neutral-950" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-neutral-950">
              Nutri<span className="text-yellow-500">Hub</span>
            </span>
          </button>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
            {links.map((link) => {
              const rotaAtiva = pathname === link.rota;
              return (
                <button
                  key={link.rota}
                  type="button"
                  onClick={() => navegar(link.rota)}
                  className={`relative py-2 text-sm font-semibold transition-colors duration-200 ${
                    rotaAtiva
                      ? "text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  {link.nome}
                  {rotaAtiva && (
                    <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-yellow-400" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {verificando ? (
              <div className="h-10 w-10 animate-pulse rounded-xl bg-neutral-100 sm:w-28" />
            ) : autenticado ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownAberto((aberto) => !aberto)}
                  aria-label="Abrir menu do usuário"
                  aria-expanded={dropdownAberto}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 transition-colors hover:border-yellow-400 hover:bg-yellow-50"
                >
                  <UserRound size={21} className="text-neutral-800" />
                  <ChevronDown
                    size={15}
                    className={`text-neutral-500 transition-transform ${
                      dropdownAberto ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownAberto && (
                  <div
                    role="menu"
                    aria-label="Menu do usuário"
                    className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_15px_45px_rgba(0,0,0,0.12)]"
                  >
                    {isAdmin ? (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => navegar("/admin")}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-yellow-50 hover:text-neutral-950"
                      >
                        <Settings size={19} />
                        Gerenciar
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => navegar("/perfil-editar")}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-yellow-50 hover:text-neutral-950"
                        >
                          <UserRoundPen size={19} />
                          Editar perfil
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => navegar("/rotina")}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-yellow-50 hover:text-neutral-950"
                        >
                          <CalendarCheck size={19} />
                          Minha rotina
                        </button>
                      </>
                    )}

                    <div className="my-2 border-t border-neutral-100" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={abrirModalLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={19} />
                      Sair da conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <button
                  type="button"
                  onClick={() => navegar("/login")}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => navegar("/cadastro")}
                  className="rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-neutral-950 transition-all hover:bg-yellow-300 hover:shadow-md"
                >
                  Cadastrar
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuMobileAberto((aberto) => !aberto)}
              aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuMobileAberto}
              className="rounded-xl border border-neutral-200 p-2.5 text-neutral-900 transition-colors hover:bg-neutral-100 lg:hidden"
            >
              {menuMobileAberto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {menuMobileAberto && (
          <div className="border-t border-neutral-100 bg-white px-5 py-5 lg:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <button
                  key={link.rota}
                  type="button"
                  onClick={() => navegar(link.rota)}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    pathname === link.rota
                      ? "bg-yellow-100 text-neutral-950"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {link.nome}
                </button>
              ))}
            </div>

            {!verificando && !autenticado && (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 sm:hidden">
                <button
                  type="button"
                  onClick={() => navegar("/login")}
                  className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-800"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => navegar("/cadastro")}
                  className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-neutral-950"
                >
                  Cadastrar
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {modalLogoutAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saindo) {
              setModalLogoutAberto(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="h-2 bg-yellow-400" />
            <div className="px-7 py-8">
              <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <LogOut size={30} className="text-yellow-700" />
                </div>
              </div>

              <div className="text-center">
                <h2 id="logout-title" className="text-xl font-bold text-neutral-950">
                  Deseja sair da sua conta?
                </h2>
                <p
                  id="logout-description"
                  className="mt-3 text-sm leading-relaxed text-neutral-500"
                >
                  Você precisará entrar novamente para acessar sua rotina e suas
                  informações pessoais.
                </p>
              </div>

              {erroLogout && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {erroLogout}
                </div>
              )}

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={saindo}
                  onClick={() => setModalLogoutAberto(false)}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                >
                  Não, cancelar
                </button>
                <button
                  type="button"
                  disabled={saindo}
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saindo ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
                      Saindo...
                    </>
                  ) : (
                    "Sim, sair"
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
