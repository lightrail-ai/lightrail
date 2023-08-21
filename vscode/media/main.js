(function () {
  const vscode = acquireVsCodeApi();

  let state = {
    proposals: [],
    currentProposalIndex: 0,
  };

  document.querySelector("#accept-button").addEventListener("click", () => {
    vscode.postMessage({
      type: "proposal-accepted",
      proposal: state.proposals[state.currentProposalIndex],
    });
    state.proposals = state.proposals.filter(
      (_, index) => index !== state.currentProposalIndex
    );
    if (state.currentProposalIndex >= state.proposals.length) {
      state.currentProposalIndex = state.proposals.length - 1;
    }
    updateUI();
  });

  document.querySelector("#reject-button").addEventListener("click", () => {
    vscode.postMessage({
      type: "proposal-rejected",
      proposal: state.proposals[state.currentProposalIndex],
    });
    state.proposals = state.proposals.filter(
      (_, index) => index !== state.currentProposalIndex
    );
    if (state.currentProposalIndex >= state.proposals.length) {
      state.currentProposalIndex = state.proposals.length - 1;
    }
    updateUI();
  });

  const noProposalsMessage = document.querySelector("#no-proposals-message");
  const proposalsContainer = document.querySelector("#proposals-container");
  const proposalCounter = document.querySelector("#proposal-counter");
  const proposalFileName = document.querySelector("#proposal-file-name");

  function updateUI() {
    if (state.proposals.length === 0) {
      noProposalsMessage.style.display = "block";
      proposalsContainer.style.display = "none";
    } else {
      vscode.postMessage({
        type: "proposal-opened",
        proposal: state.proposals[state.currentProposalIndex],
      });
      noProposalsMessage.style.display = "none";
      proposalsContainer.style.display = "block";
      proposalCounter.innerText = `${state.currentProposalIndex + 1} / ${
        state.proposals.length
      }`;
      proposalFileName.innerText =
        state.proposals[state.currentProposalIndex][0];
    }
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "propose": {
        state.proposals = message.proposals;
        state.currentProposalIndex = 0;
        updateUI();
        break;
      }
    }
  });
})();
