(function () {
  const url = "https://8xbet86.com/";
  const footerImgDesktop = "https://i.imgur.com/Fen20UR.gif";
  const footerImgMobile = "https://i.imgur.com/JtIJ2hM.gif";

  const style = document.createElement("style");
  style.textContent = `
    #catfish-footer {
      position: fixed; bottom: 0; width: 100%;
      z-index: 9997; background: transparent;
      text-align: center;
    }
    #catfish-footer img {
      width: 100%; max-height: 100px;
      object-fit: contain;
      cursor: pointer;
    }
    body { padding-bottom: 100px; }
  `;
  document.head.appendChild(style);

  const footer = document.createElement("div");
  footer.id = "catfish-footer";

  const footerLink = document.createElement("a");
  footerLink.href = url;
  footerLink.target = "_blank";

  const footerImgEl = document.createElement("img");
  footerImgEl.src = window.innerWidth <= 768 ? footerImgMobile : footerImgDesktop;

  footerLink.appendChild(footerImgEl);
  footer.appendChild(footerLink);

  window.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(footer);
  });
})();
