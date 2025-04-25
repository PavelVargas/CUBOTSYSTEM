let productos = JSON.parse(localStorage.getItem("inventario") || "[]");

function guardar() {
  localStorage.setItem("inventario", JSON.stringify(productos));
}

function agregar() {
  const nombre = document.getElementById("nombre").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const categoria = document.getElementById("categoria").value;

  if (!nombre || cantidad <= 0 || !categoria) {
    return alert("Completa todos los campos");
  }

  const nuevo = {
    id: productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1,
    nombre,
    cantidad,
    categoria
  };

  productos.push(nuevo);
  guardar();
  mostrar();
  actualizarGrafico();

  document.getElementById("nombre").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("categoria").value = "";
}

function editar(id) {
  const tr = document.querySelector(`#producto-${id}`);
  const inputs = tr.querySelectorAll('input, select');
  const editarBtn = tr.querySelector('.editar-btn');
  
  // Si ya están editando, habilitamos los inputs y el botón
  const editable = inputs[0].disabled;
  
  inputs.forEach(input => input.disabled = !editable);
  
  if (editable) {
    // Si estaba deshabilitado, habilitamos los inputs para editar
    editarBtn.textContent = 'Guardar';
  } else {
    // Si estaba habilitado, guardamos los cambios
    const nombre = tr.querySelector('input[name="nombre"]').value;
    const cantidad = parseInt(tr.querySelector('input[name="cantidad"]').value);
    const categoria = tr.querySelector('select[name="categoria"]').value;
    
    const producto = productos.find(p => p.id === id);
    producto.nombre = nombre;
    producto.cantidad = cantidad;
    producto.categoria = categoria;
    
    guardar();
    editarBtn.textContent = 'Editar';
    actualizarGrafico();
  }
}

function eliminar(id) {
  productos = productos.filter(p => p.id !== id);
  guardar();
  mostrar();
  actualizarGrafico();
}

function mostrar() {
  const lista = document.getElementById("lista");
  const filtroTexto = document.getElementById("search").value.toLowerCase();
  const filtroCategoria = document.getElementById("filtroCategoria").value;
  lista.innerHTML = "";

  productos
    .filter(p => 
      p.nombre.toLowerCase().includes(filtroTexto) &&
      (filtroCategoria === "" || p.categoria === filtroCategoria)
    )
    .forEach(p => {
      const tr = document.createElement("tr");
      tr.id = `producto-${p.id}`;
      tr.innerHTML = `
        <td><input type="text" name="nombre" value="${p.nombre}" style="width: 60%;" disabled></td>
        <td><input type="number" name="cantidad" value="${p.cantidad}" disabled></td>
        <td>
          <select name="categoria" disabled>
            <option ${p.categoria === "Electrónica" ? "selected" : ""}>Electrónica</option>
            <option ${p.categoria === "Ropa" ? "selected" : ""}>Ropa</option>
            <option ${p.categoria === "Alimentos" ? "selected" : ""}>Alimentos</option>
            <option ${p.categoria === "Otros" ? "selected" : ""}>Otros</option>
          </select>
        </td>
        <td>
          <div class="buttons-container">
            <button class="editar-btn" onclick="editar(${p.id})">Editar</button>
            <button onclick="eliminar(${p.id})">Eliminar</button>
          </div>
        </td>
      `;
      lista.appendChild(tr);
    });
}

let chart;

function actualizarGrafico() {
  const ctx = document.getElementById("stockChart").getContext("2d");
  const data = productos.reduce((acc, p) => {
    acc[p.nombre] = (acc[p.nombre] || 0) + p.cantidad;
    return acc;
  }, {});

  const labels = Object.keys(data);
  const cantidades = Object.values(data);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Stock por producto',
        data: cantidades,
        backgroundColor: '#b4743c',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

mostrar();
actualizarGrafico();
