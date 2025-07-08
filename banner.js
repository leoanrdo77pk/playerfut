const bannerScript = `
<script>
document.addEventListener("DOMContentLoaded", function () {
  const footer = document.createElement("div");
  footer.id = "custom-footer";
  footer.innerHTML = \`
    <a href="https://8xbet86.com/" target="_blank">
      <img src="https://i.imgur.com/Fen20UR.gif" alt="Banner de Anúncio" />
    </a>
  \`;
  document.body.appendChild(footer);

  const style = document.createElement("style");
  style.innerHTML = \`
    #custom-footer {
      position: fixed;
      bottom: 0;
      width: 100%;
      z-index: 9999;
      background: transparent;
      text-align: center;
      padding: 10px;
    }
    #custom-footer img {
      width: 100%;
      max-height: 100px;
      object-fit: contain;
      cursor: pointer;
    }
    body {
      padding-bottom: 120px !important;
    }
  \`;
  document.head.appendChild(style);
});
</script>
</body>`;
