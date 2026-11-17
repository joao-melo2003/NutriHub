export interface CadastroUsuario {
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  senhaConfirm: string;
  dataNascimento: string;
  sexo: "M" | "F";
}

export interface UpdateUsuarioPayload {
  nome?: string;
  email?: string;
}

export interface UsuarioUpdateResponse {
  nome: string | null;
  email: string | null;
}

export interface ExcluirContaPayload {
  confirm: boolean;
  senha: string;
}

export interface UpdateSenhaPayload {
  senhaAntiga: string;
  senha: string;
  senhaConfirm: string;
}

export interface UsuarioResponse {
  cpf: string;
  nome: string;
  email: string;
  dataNascimento: string;
  sexo: string;
  tipo: "COMUM" | "ADMIN" | string;
  status: string;
  qtSenha: number;
}

export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

export interface UsuariosPorStatusResponse {
  usuarios_ativos: PageResponse<UsuarioResponse>;
  usuarios_banidos: PageResponse<UsuarioResponse>;
  usuarios_desativados: PageResponse<UsuarioResponse>;
}

export interface IndexUsuariosParams {
  paginaAtivos?: number;
  paginaBanidos?: number;
  paginaDesativados?: number;
}

export interface BanirRequest {
  cpfUser: string;
}

export interface AlimentoRequest {
  nome: string;
  categoria: string;
  calorias: number;
  proteina: number;
  carboidratos: number;
  gorduras: number;
}

export type AlimentoUpdateRequest = Partial<AlimentoRequest>;

export interface AlimentoResponse {
  id: string;
  nome: string;
  categoria: string;
  calorias: number;
  proteina: number;
  carboidratos: number;
  gorduras: number;
}

export type TipoRestricao = "ALERGIA" | "INTOLERANCIA" | "CONDICAO" | "RESTRICAO" | string;

export interface RestricaoRequest {
  nome: string;
  tipo: TipoRestricao;
}

export type RestricaoUpdateRequest = Partial<RestricaoRequest>;

export interface RestricaoResponse {
  id: string;
  nome: string;
  tipo: TipoRestricao;
}

export interface BuscaRestricaoParams {
  nome?: string;
  tipo?: TipoRestricao;
  pagina?: number;
}