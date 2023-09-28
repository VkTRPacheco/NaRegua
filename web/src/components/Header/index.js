const Header = () => {
    return (
        <header className="container-fluid d-flex justify-content-end">
            <div className="d-flex align-itens-center">
                <div>
                    <span className="d-block m-0 p-0 text-white">Barbearia X</span>
                    <small className="m-0 p-0">Plano Gold</small>
                </div>
                <img src="https://conteudo.imguol.com.br/c/entretenimento/d5/2020/10/07/homem-com-vergonha-1602098705397_v2_1254x836.jpg"/>
                <span className="mdi mdi-chevron-down text-white"></span>
            </div>
        </header>
    );
};

export default Header;