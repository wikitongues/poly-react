class Dictionary extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isPhraseInputActive: false,
      isTargetInputActive: false,
      isContinuousInputActive: false,
      phrasePairs: this.props.initialPhrasePairs,
      sourcePhrase: '',
      targetPhrase: '',
    };
    this.onAddNewPhraseButtonClick = this.onAddNewPhraseButtonClick.bind(this);
    this.onSourcePhraseChange = this.onSourcePhraseChange.bind(this);
    this.onSourcePhraseSubmit = this.onSourcePhraseSubmit.bind(this);
    this.onTargetPhraseChange = this.onTargetPhraseChange.bind(this);
    this.onTargetPhraseSubmit = this.onTargetPhraseSubmit.bind(this);
    this.onTargetPhraseMultipleSubmit = this.onTargetPhraseMultipleSubmit.bind(this);
    this.onContinuousInputClick = this.onContinuousInputClick.bind(this);
    this.onDeletePhrasePair = this.onDeletePhrasePair.bind(this);
    this.onCancelEditPhrase = this.onCancelEditPhrase.bind(this);
    this.renderPhrasePairs = this.renderPhrasePairs.bind(this);
    this.renderCreateNewPhraseButton = this.renderCreateNewPhraseButton.bind(this);
    this.renderPhraseInputFields = this.renderPhraseInputFields.bind(this);
    this.renderTargetInput = this.renderTargetInput.bind(this);
    this.renderInputMethod = this.renderInputMethod.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ phrasePairs: newProps.initialPhrasePairs });
  }

  onAddNewPhraseButtonClick() {
    this.setState({ isPhraseInputActive: !this.state.isPhraseInputActive });
  }

  onSourcePhraseChange(e) {
    this.setState({ sourcePhrase: e.target.value });
  }

  onSourcePhraseSubmit(e) {
    e.preventDefault();
    if (this.state.sourcePhrase) {
      this.props.onSourcePhraseSubmit(this.state.sourcePhrase);
      this.setState({
        isTargetInputActive: !this.state.isTargetInputActive,
        sourcePhrase: '',
      });
    } else {
      alert('Source phrase is empty');
    }
  }

  onTargetPhraseChange(e) {
    this.setState({ targetPhrase: e.target.value });
  }

  onTargetPhraseSubmit(e) {
    e.preventDefault();
    if (this.state.targetPhrase) {
      this.props.onTargetPhraseSubmit(this.state.targetPhrase);
      this.setState({
        isPhraseInputActive: !this.state.isPhraseInputActive,
        isTargetInputActive: !this.state.isTargetInputActive,
        targetPhrase: '',
      });
    } else {
      alert('Target phrase is empty');
    }
  }

  onTargetPhraseMultipleSubmit(e) {
    e.preventDefault();
    this.props.onTargetPhraseSubmit(this.state.targetPhrase);
    this.setState({
      isTargetInputActive: !this.state.isTargetInputActive,
      targetPhrase: '',
    });
  }

  onContinuousInputClick() {
    this.setState({ isContinuousInputActive: !this.state.isContinuousInputActive });
  }

  onDeletePhrasePair(phrasePairId) {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      $.ajax({
        url: '/phrase_pairs/' + phrasePairId,
        type: 'DELETE',
        success: function (response) {
          const phrasePairs = this.state.phrasePairs;
          const indexToRemove = _.findIndex(phrasePairs, (phrasePair) => {
            return phrasePair.id === response.id;
          });
          phrasePairs.splice(indexToRemove, 1);
          this.setState({ phrasePairs });
        }.bind(this),
        error() {
          console.log('Error: Could not delete phrase pair')
        },
      });
    }
  }

  onCancelEditPhrase() {
    this.setState({ isPhraseInputActive: !this.state.isPhraseInputActive });
  }

  renderPhrasePairs() {
    return this.state.phrasePairs.map((phrasePair, index) => {
      return (
          <PhrasePair
            id={phrasePair.id}
            isOwnedByCurrentUser={this.props.isOwnedByCurrentUser}
            initialSourcePhrase={phrasePair.source_phrase}
            initialTargetPhrase={phrasePair.target_phrase}
            key={index}
            onDeletePhrasePair={this.onDeletePhrasePair}
            menu={this.props.menu}
            flip={this.props.flip}
            save={this.props.save}
            delete={this.props.delete}
            edit={this.props.edit}
            close={this.props.close}
          />
      );
    });
  }

  renderCreateNewPhraseButton() {
    if (this.props.isOwnedByCurrentUser) {
      if (this.state.isPhraseInputActive) {
        return (
          <div>{this.renderPhraseInputFields()}</div>
        );
      }
      return (
        <button className="addPhrase" onClick={this.onAddNewPhraseButtonClick}>+</button>
      );
    }
  }

  renderPhraseInputFields() {
    if (this.state.isTargetInputActive) {
      return (
        <div>
          { this.renderInputMethod() }
          { this.renderTargetInput() }
        </div>
      );
    }
    return (
      <div>
        { this.renderInputMethod() }
        <form className="newPhrase" onSubmit={this.onSourcePhraseSubmit}>
          <input
            value={this.state.sourcePhrase}
            onChange={this.onSourcePhraseChange}
            className="sourcePhrase input"
            type="text"
            placeholder="Source"
          />
          <button className="savePhrase">Save</button>
        </form>
      </div>
    );
  }

  // NB If in continuous input state, show source input field following successful phrase pair completion.
  renderTargetInput() {
    const continuousInput = this.state.isContinuousInputActive;
    return (
      <form
        className="newPhrase"
        onSubmit={continuousInput ? this.onTargetPhraseMultipleSubmit : this.onTargetPhraseSubmit}
      >
        <input
          value={this.state.targetPhrase}
          onChange={this.onTargetPhraseChange}
          className="targetPhrase input"
          type="text"
          placeholder="Target"
        />
        <button className="savePhrase"> Save </button>
      </form>
    );
  }

  // TODO: Consider the flow of canceling a phrase in progress.
  renderInputMethod() {
    if (this.state.isContinuousInputActive) {
      return (
        <div className="inputMethod">
          <label>
            <input type="checkbox" checked onChange={this.onContinuousInputClick} />
            Continuous entry
          </label>
          <button title="Cancel" onClick={this.onCancelEditPhrase} className="close icon">
            <img src={this.props.close} alt="close" />
          </button>
        </div>
      );
    }
    return (
      <div className="inputMethod">
        <label>
          <input type="checkbox" onChange={this.onContinuousInputClick} />
          Continuous entry
        </label>
        <button title="Cancel" onClick={this.onCancelEditPhrase} className="close icon">
          <img src={this.props.close} alt="close" />
        </button>
      </div>
    );
  }

  render() {
    if (this.state.phrasePairs.length !== 0) {
      return (
         <div className="dictionary">
          <ul className="content">{this.renderPhrasePairs()}</ul>
          {this.renderCreateNewPhraseButton()}
         </div>
      );
    }
    return (
      <div className="dictionary">
        <span className="notice">Phrasebook is empty</span>
        <DummyContent />
        {this.renderCreateNewPhraseButton()}
      </div>
    );
  }
}

Dictionary.propTypes = {

};
