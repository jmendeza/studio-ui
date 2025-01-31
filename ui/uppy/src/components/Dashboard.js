const FileList = require('./FileList');
const AddFiles = require('@uppy/dashboard/lib/components/AddFiles');
const AddFilesPanel = require('@uppy/dashboard/lib/components/AddFilesPanel');
const PanelTopBar = require('./PickerPanelTopBar');
const Slide = require('@uppy/dashboard/lib/components/Slide');
const classNames = require('classnames');
const isDragDropSupported = require('@uppy/utils/lib/isDragDropSupported');
const { h } = require('preact');
const React = require('react');

// http://dev.edenspiekermann.com/2016/02/11/introducing-accessible-modal-dialog
// https://github.com/ghosh/micromodal

const WIDTH_XL = 900;
const WIDTH_LG = 700;
const WIDTH_MD = 576;
const HEIGHT_MD = 400;

module.exports = function Dashboard(props) {
  const noFiles = props.totalFileCount === 0;
  const isSizeMD = props.containerWidth > WIDTH_MD;

  const wrapperClassName = classNames({
    'uppy-Root': props.isTargetDOMEl
  });

  const dashboardClassName = classNames({
    'uppy-Dashboard': true,
    'uppy-Dashboard--animateOpenClose': props.animateOpenClose,
    'uppy-Dashboard--isClosing': props.isClosing,
    'uppy-Dashboard--isDraggingOver': props.isDraggingOver,
    'uppy-Dashboard--modal': !props.inline,
    'uppy-size--md': props.containerWidth > WIDTH_MD,
    'uppy-size--lg': props.containerWidth > WIDTH_LG,
    'uppy-size--xl': props.containerWidth > WIDTH_XL,
    'uppy-size--height-md': props.containerHeight > HEIGHT_MD,
    'uppy-Dashboard--isAddFilesPanelVisible': props.showAddFilesPanel,
    'uppy-Dashboard--isInnerWrapVisible': props.areInsidesReadyToBeVisible
  });

  // Important: keep these in sync with the percent width values in `src/components/FileItem/index.scss`.
  let itemsPerRow = 1;

  const showFileList = props.showSelectedFiles && !noFiles;

  const numberOfFilesForRecovery = props.recoveredState ? Object.keys(props.recoveredState.files).length : null;
  const numberOfGhosts = props.files
    ? Object.keys(props.files).filter((fileID) => props.files[fileID].isGhost).length
    : null;

  const renderRestoredText = () => {
    if (numberOfGhosts > 0) {
      return props.i18n('recoveredXFiles', {
        smart_count: numberOfGhosts
      });
    }

    return props.i18n('recoveredAllFiles');
  };

  const dashboard = (
    <div
      className={dashboardClassName}
      data-uppy-theme={props.theme}
      data-uppy-num-acquirers={props.acquirers.length}
      data-uppy-drag-drop-supported={!props.disableLocalFiles && isDragDropSupported()}
      aria-hidden={props.inline ? 'false' : props.isHidden}
      aria-disabled={props.disabled}
      aria-label={!props.inline ? props.i18n('dashboardWindowTitle') : props.i18n('dashboardTitle')}
      onPaste={props.handlePaste}
      onDragOver={props.handleDragOver}
      onDragLeave={props.handleDragLeave}
      onDrop={props.handleDrop}
    >
      <div aria-hidden="true" className="uppy-Dashboard-overlay" tabIndex={-1} onClick={props.handleClickOutside} />

      <div
        className="uppy-Dashboard-inner"
        aria-modal={!props.inline && 'true'}
        role={!props.inline && 'dialog'}
        style={{
          width: props.inline && props.width ? props.width : '',
          height: props.inline && props.height ? props.height : ''
        }}
      >
        {!props.inline ? (
          <button
            className="uppy-u-reset uppy-Dashboard-close"
            type="button"
            aria-label={props.i18n('closeModal')}
            title={props.i18n('closeModal')}
            onClick={props.closeModal}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        ) : null}

        <div className="uppy-Dashboard-innerWrap">
          <div className="uppy-Dashboard-dropFilesHereHint">{props.i18n('dropHint')}</div>

          {numberOfFilesForRecovery && (
            <div className="uppy-Dashboard-serviceMsg">
              <svg
                className="uppy-Dashboard-serviceMsg-icon"
                aria-hidden="true"
                focusable="false"
                width="21"
                height="16"
                viewBox="0 0 24 19"
              >
                <g transform="translate(0 -1)" fill="none" fillRule="evenodd">
                  <path
                    d="M12.857 1.43l10.234 17.056A1 1 0 0122.234 20H1.766a1 1 0 01-.857-1.514L11.143 1.429a1 1 0 011.714 0z"
                    fill="#FFD300"
                  />
                  <path fill="#000" d="M11 6h2l-.3 8h-1.4z" />
                  <circle fill="#000" cx="12" cy="17" r="1" />
                </g>
              </svg>
              <strong className="uppy-Dashboard-serviceMsg-title">{props.i18n('sessionRestored')}</strong>
              <div className="uppy-Dashboard-serviceMsg-text">{renderRestoredText()}</div>
            </div>
          )}

          {showFileList ? (
            <FileList {...props} itemsPerRow={itemsPerRow} />
          ) : (
            <div
              style={{
                textAlign: 'center',
                verticalAlign: 'middle',
                top: '50%',
                position: 'relative',
                transform: 'translate(0, -50%)'
              }}
            >
              <div>
                <AddFiles {...props} isSizeMD={isSizeMD} />
              </div>
              <div>
                <div
                  className="uppy-Dashboard-AddFiles"
                  style={{
                    color: '#949494',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}
                >
                  {props.externalMessages.maxFiles}
                </div>
              </div>
            </div>
          )}

          <Slide>
            {props.showAddFilesPanel ? <AddFilesPanel key="AddFiles" {...props} isSizeMD={isSizeMD} /> : null}
          </Slide>

          <Slide>{props.fileCardFor ? <FileCard key="FileCard" {...props} /> : null}</Slide>

          <Slide>{props.activePickerPanel ? <PickerPanelContent key="Picker" {...props} /> : null}</Slide>

          <Slide>{props.showFileEditor ? <EditorPanel key="Editor" {...props} /> : null}</Slide>

          {showFileList && <PanelTopBar {...props} />}

          <div className="uppy-Dashboard-progressindicators">
            {props.progressindicators.map((target) => {
              return props.uppy.getPlugin(target.id).render(props.state);
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    // Wrap it for RTL language support
    <div class={wrapperClassName} dir={props.direction}>
      <div class="uppy-dashboard-header">
        <h2 className="MuiTypography-root MuiTypography-h6 uppy-dashboard-header-title">
          {props.title} {Boolean(props.totalFileCount) && `(${props.completeFiles.length}/${props.totalFileCount})`}
        </h2>
        <div class="uppy-dashboard-header-actions">
          <button
            title={props.i18n('minimize')}
            onClick={props.onMinimized}
            tabIndex="0"
            type="button"
            aria-label="minimize"
            className="uppy-dashboard-button-base uppy-dashboard-icon-button"
          >
            <svg
              className="uppy-dashboard-svg-icon"
              focusable="false"
              viewBox="0 0 24 24"
              aria-hidden="true"
              data-testid="RemoveRoundedIcon"
            >
              <path d="M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z"></path>
            </svg>
          </button>
          <button
            title={props.i18n('close')}
            onClick={props.onClose}
            tabIndex="0"
            type="button"
            aria-label="close"
            className="uppy-dashboard-button-base uppy-dashboard-icon-button"
          >
            <svg
              className="uppy-dashboard-svg-icon"
              focusable="false"
              viewBox="0 0 24 24"
              aria-hidden="true"
              data-testid="CloseRoundedIcon"
            >
              <path d="M18.3 5.71a.9959.9959 0 0 0-1.41 0L12 10.59 7.11 5.7a.9959.9959 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
            </svg>
          </button>
        </div>
      </div>
      {dashboard}
    </div>
  );
};
