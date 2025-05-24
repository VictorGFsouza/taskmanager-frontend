import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Tarefas = () => {
  const [tarefas, setTarefas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [tarefaModal, setTarefaModal] = useState({
    id: null,
    titulo: "",
    descricao: "",
    dataCriacao: "",
    dataFinalizacao: "",
    statusId: ""
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const apiUrl = "https://localhost:7131/Task";

  const buscarTarefas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}`, {
        params: statusFiltro ? { status: statusFiltro } : {},
      });
      setTarefas(response.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
    setLoading(false);
  };


  const abrirModal = (tarefa = {
    id: 0,
    titulo: "",
    descricao: "",
    dataCriacao: "",
    dataFinalizacao: "",
    statusId: ""
  }) => {
    setTarefaModal({
      id: tarefa.id || 0,
      titulo: tarefa.title || "",
      descricao: tarefa.description || "",
      dataCriacao: tarefa.createDate || "",
      dataFinalizacao: tarefa.finishDate || "",
      statusId: tarefa.status || ""
    });
    setModalVisible(true);
  };  

  const fecharModal = () => {
    setTarefaModal({ id: 0, title: "", description: "" });
    setModalVisible(false);
  };

  const salvarTarefa = async () => {
    if (!tarefaModal.titulo || !tarefaModal.dataCriacao || !tarefaModal.statusId) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
  
    const payload = {
      id: tarefaModal.id,
      title: tarefaModal.titulo,
      description: tarefaModal.descricao != "" ? tarefaModal.descricao : null,
      createDate: tarefaModal.dataCriacao,
      finishDate: tarefaModal.dataFinalizacao != "" ? tarefaModal.dataFinalizacao : null,
      status: tarefaModal.statusId
    };

    try {
      if (tarefaModal.id) { 
        await axios.patch(`${apiUrl}/${tarefaModal.id}`, payload);
        alert("Tarefa atualizada com sucesso!");
      } else {
        await axios.post(apiUrl, payload);
        alert("Tarefa cadastrada com sucesso!");
      }
      fecharModal();
      buscarTarefas();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      alert("Erro ao salvar tarefa.");
    }
  };

  const excluirTarefa = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      return;
    }
    try {
      await axios.delete(`${apiUrl}/${id}`);
      alert("Tarefa excluída com sucesso!");
      buscarTarefas();
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      alert("Erro ao excluir tarefa.");
    }
  };

  const [statusOptions, setStatusOptions] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("");

  const carregarStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/Status`);
      setStatusOptions(response.data);
    } catch (error) {
      console.error("Erro ao carregar status", error);
    }
  };

  useEffect(() => {
    carregarStatus();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gerenciador de Tarefas</h1>
      <div className="d-flex justify-content-end mb-3 gap-2">
        <select
          className="form-select"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="">Status</option>
          {statusOptions.map((status) => (
            <option key={status.id} value={status.id}>
              {status.descricao}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={buscarTarefas}>
          Consultar
        </button>
        <button className="btn btn-success" onClick={() => abrirModal()}>
          Nova Tarefa
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="table table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Título</th>
              <th>Descrição</th>
              <th>Data Criação</th>
              <th>Data Finalização</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tarefas.length > 0 ? (
              tarefas.map((tarefa) => (
                <tr key={tarefa.id}>
                  <td>{tarefa.title}</td>
                  <td>{tarefa.description}</td>
                  <td>{tarefa.createDate?.split("T")[0]}</td>
                  <td>{tarefa.finishDate?.split("T")[0]}</td>
                  <td>{tarefa.statusDescricao}</td>
                  <td>
                    <button className="btn btn-success btn-sm mx-1" onClick={() => abrirModal(tarefa)}>
                      Editar
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => excluirTarefa(tarefa.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">Nenhuma tarefa encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalVisible && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{tarefaModal.id ? "Editar Tarefa" : "Nova Tarefa"}</h5>
                <button className="btn-close" onClick={fecharModal}></button>
              </div>
              <div className="modal-body">
                <div className="form-group mb-2">
                  <label>Título</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tarefaModal.titulo}
                    onChange={(e) => setTarefaModal({ ...tarefaModal, titulo: e.target.value })}
                  />
                </div>

                <div className="form-group mb-2">
                  <label>Descrição</label>
                  <textarea
                    className="form-control"
                    value={tarefaModal.descricao}
                    onChange={(e) => setTarefaModal({ ...tarefaModal, descricao: e.target.value })}
                  />
                </div>

                <div className="form-group mb-2">
                  <label>Data de Criação</label>
                  <input
                    type="date"
                    className="form-control"
                    value={tarefaModal.dataCriacao ? tarefaModal.dataCriacao.split("T")[0] : ""}
                    onChange={(e) => setTarefaModal({ ...tarefaModal, dataCriacao: e.target.value })}
                  />
                </div>

                <div className="form-group mb-2">
                  <label>Data de Finalização</label>
                  <input
                    type="date"
                    className="form-control"
                    value={tarefaModal.dataFinalizacao ? tarefaModal.dataFinalizacao.split("T")[0] : ""}
                    onChange={(e) => setTarefaModal({ ...tarefaModal, dataFinalizacao: e.target.value })}
                  />
                </div>

                <div className="form-group mb-2">
                  <label>Status</label>
                  <select
                    className="form-select"
                    value={tarefaModal.statusId}
                    onChange={(e) => setTarefaModal({ ...tarefaModal, statusId: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.descricao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={fecharModal}>Cancelar</button>
                <button className="btn btn-primary" onClick={salvarTarefa}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tarefas;