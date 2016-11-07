PhrasePair = React.createClass( {

  getInitialState() {
    return {
      isEditingPhrase: false,
      sourcePhrase: this.props.initialSourcePhrase,
      targetPhrase: this.props.initialTargetPhrase,
      isSourceVideoloading: true,
      isTargetVideoloading: true,
    }
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      sourcePhrase: nextProps.initialSourcePhrase,
      targetPhrase: nextProps.initialTargetPhrase
    })
  },

  toggleEditingPhraseState() {
      this.setState({
        isEditingPhrase: !this.state.isEditingPhrase
    });
  },

  cancelEditingPhraseState: function(e) {
    e.preventDefault();
    this.setState({
      sourcePhrase: this.props.initialSourcePhrase,
      targetPhrase: this.props.initialTargetPhrase,
      isEditingPhrase: false
    })
  },

  onDeletePhraseClick: function() {
    this.props.onDeletePhrasePair(this.props.id)
  },

  onSavePhraseClick:function(e){
    e.preventDefault();
    $.ajax({
      url: '/phrase_pairs/' + this.props.id,
      type: 'PUT',
      data: {
        phrase_pair: {
          source_phrase: this.state.sourcePhrase,
          target_phrase: this.state.targetPhrase
        }
      },
      success: function() {
        this.toggleEditingPhraseState();
      }.bind(this),
      error: function() {
        console.log("Error: Could not save phrase")
      }
    })
  },

  onEditPhraseClick() {
    this.toggleEditingPhraseState();
  },

  onSourceChange(e) {
    this.setState({ sourcePhrase: e.target.value })
  },

  onTargetChange(e) {
    this.setState({ targetPhrase: e.target.value });
  },

  renderSourceVideo(src, name) {
    setTimeout(() => {
      this.setState({ isSourceVideoloading: false });
    }, 10000);

    const stickedClass = `container-iframe ${name}`;

    if (this.state.isSourceVideoloading) {
      return (
        <div className={stickedClass}>
          {this.renderLoader()}
        </div>
      );
    }
    return (
      <div className={stickedClass}>
        {this.renderIframe(src)}
      </div>
    );
  },

  renderTargetVideo(src, name) {
    setTimeout(() => {
      this.setState({ isTargetVideoloading: false });
    }, 10000);

    const stickedClass = `container-iframe ${name}`;

    if (this.state.isTargetVideoloading) {
      return (
        <div className={stickedClass}>
          {this.renderLoader()}
        </div>
      );
    }
    return (
      <div className={stickedClass}>
        {this.renderIframe(src)}
      </div>
    );
  },

  renderIframe(src) {
    return <iframe className="iframe" src={src} frameBorder="0" />;
  },

  renderLoader() {
    return (
      <div className="loader-container">
        <div className="loader-message">Processing the video...</div>
        <div className="loader"></div>
      </div>
    );
  },

  renderParagraph(text) {
    return (
      <p>{text}</p>
    );
  },
  renderSourceInput(status) {
    return (<input
      disabled={status}
      value={this.state.sourcePhrase}
      onChange={this.onSourceChange}
      name="sourcePhrase"
    />);
  },
  renderTargetInput(status) {
    return (<input
      disabled={status}
      value={this.state.targetPhrase}
      onChange={this.onTargetChange}
      name="targetPhrase"
    />);
  },

  renderPhraseMenu() {
    if (this.props.isOwnedByCurrentUser) {
      if (this.state.isEditingPhrase) {
        return (
          <li className="menu saving">
            <button title="Save" onClick={this.onSavePhraseClick} className="icon">
              <img src={this.props.save}/>
            </button>
            <button title="Cancel" onClick={this.cancelEditingPhraseState} className="close icon">
              <img src={this.props.close}/>
            </button>
          </li>
        );
      } else {
        return (
          <li className="menu">
            <button title="Menu" className="more icon">
              <img src={this.props.menu}/>
            </button>
            <button title="Edit" onClick={this.onEditPhraseClick} className="icon">
              <img src={this.props.edit}/>
            </button>
            <button title="Delete" onClick={this.onDeletePhraseClick} className="icon">
              <img src={this.props.delete}/>
            </button>
          </li>
        );
      }
    }
  },

  renderPhrasePair() {
    if (this.state.isEditingPhrase) {
      return (
        <ul>
          <form onSubmit={this.onSavePhraseClick}>
            <li className="source">
              {
                this.state.sourcePhrase.startsWith('http://www.youtube') ?
                  this.renderSourceInput(true)
                  :
                  this.renderSourceInput(false)
              }
            </li>
            <li className="target">
              {
                this.state.targetPhrase && this.state.targetPhrase.startsWith('http://www.youtube') ?
                  this.renderTargetInput(true)
                  :
                  this.renderTargetInput(false)
              }
            </li>
            { this.renderPhraseMenu() }
          </form>
        </ul>
      );
    } else {
      // Checks whether the source phrase or the target phrase is a video and renders
      // an iframe or a paragraph accordingly
      return (
        <ul>
          <li className="source">
            {
              this.state.sourcePhrase.startsWith('http://www.youtube') ?
                this.renderSourceVideo(this.state.sourcePhrase, 'source')
                :
                this.renderParagraph(this.state.sourcePhrase)
            }
          </li>
          <li className="target">
            {
              this.state.targetPhrase && this.state.targetPhrase.startsWith('http://www.youtube') ?
                this.renderTargetVideo(this.state.targetPhrase, 'target')
                :
                this.renderParagraph(this.state.targetPhrase)
            }
          </li>
          { this.renderPhraseMenu() }
        </ul>
      );
    }
  },

  render() {
    return (
      <li className="entry">
        { this.renderPhrasePair() }
      </li>
    );
  },
});
