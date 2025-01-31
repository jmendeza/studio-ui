/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import Dialog from '@mui/material/Dialog';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import PluginCard from '../PluginCard/PluginCard';
import Spinner from '../Spinner/Spinner';
import BlueprintForm from './BlueprintForm';
import BlueprintReview from './BlueprintReview';
import LoadingState from '../LoadingState/LoadingState';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { MarketplacePlugin } from '../../models/MarketplacePlugin';
import { CreateSiteMeta, MarketplaceSite, SiteState, Views } from '../../models/Site';
import { defineMessages, useIntl } from 'react-intl';
import PluginDetailsView from '../PluginDetailsView/PluginDetailsView';
import EmptyState from '../EmptyState/EmptyState';
import { setRequestForgeryToken, setSiteCookie } from '../../utils/auth';
import { create, exists, fetchBlueprints as fetchBuiltInBlueprints } from '../../services/sites';
import {
  createSite as createSiteFromMarketplace,
  fetchBlueprints as fetchMarketplaceBlueprintsService
} from '../../services/marketplace';
import gitLogo from '../../assets/git-logo.svg';
import { fadeIn } from 'react-animations';
import { Subscription } from 'rxjs';
import SearchBar from '../SearchBar/SearchBar';
import DialogHeader from '../DialogHeader';
import DialogBody from '../DialogBody/DialogBody';
import DialogFooter from '../DialogFooter/DialogFooter';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import ApiResponseErrorState from '../ApiResponseErrorState';
import PrimaryButton from '../PrimaryButton';
import Button from '@mui/material/Button';
import { nnou } from '../../utils/object';
import { useEnv } from '../../hooks/useEnv';
import { useSpreadState } from '../../hooks/useSpreadState';
import { getSystemLink } from '../../utils/system';
import { keyframes } from 'tss-react';
import SignalWifiBadRounded from '@mui/icons-material/SignalWifiBadRounded';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

const messages = defineMessages({
  privateBlueprints: {
    id: 'createSiteDialog.privateBlueprints',
    defaultMessage: 'Private Blueprints'
  },
  marketplace: {
    id: 'common.marketplace',
    defaultMessage: 'Marketplace'
  },
  publicMarketplaceBlueprints: {
    id: 'createSiteDialog.publicMarketplaceBlueprints',
    defaultMessage: 'Public Marketplace Blueprints'
  },
  back: {
    id: 'common.back',
    defaultMessage: 'Back'
  },
  noMarketplaceBlueprints: {
    id: 'createSiteDialog.noMarketplaceBlueprints',
    defaultMessage: 'No Marketplace Blueprints Were Found'
  },
  changeQuery: {
    id: 'createSiteDialog.changeQuery',
    defaultMessage: 'Try changing your query or browse the full catalog.'
  },
  creatingSite: {
    id: 'createSiteDialog.creatingSite',
    defaultMessage: 'Creating Project'
  },
  pleaseWait: {
    id: 'createSiteDialog.pleaseWait',
    defaultMessage: 'Please wait while your project is being created.'
  },
  createInBackground: {
    id: 'createSiteDialog.createInBackground',
    defaultMessage: 'Create in Background'
  },
  dialogCloseTitle: {
    id: 'createSiteDialog.dialogCloseTitle',
    defaultMessage: 'Confirm Close'
  },
  dialogCloseMessage: {
    id: 'createSiteDialog.dialogCloseMessage',
    defaultMessage: 'Data entered in the form would be lost upon closing.'
  },
  gitBlueprintName: {
    id: 'createSiteDialog.gitBlueprintName',
    defaultMessage: 'Remote Git Repository'
  },
  gitBlueprintDescription: {
    id: 'createSiteDialog.gitBlueprintDescription',
    defaultMessage: 'Create a new project based on a CrafterCMS project in an existing, remote git repository.'
  },
  createSite: {
    id: 'createSiteDialog.createSite',
    defaultMessage: 'Create Project'
  },
  review: {
    id: 'createSiteDialog.review',
    defaultMessage: 'Review'
  },
  finish: {
    id: 'createSiteDialog.finish',
    defaultMessage: 'Finish'
  },
  nameAndDescription: {
    id: 'createSiteDialog.nameAndDescription',
    defaultMessage: 'Name and describe your project'
  },
  reviewSite: {
    id: 'createSiteDialog.reviewSite',
    defaultMessage: 'Review set up summary and create your project'
  },
  showIncompatible: {
    id: 'createSiteDialog.showIncompatible',
    defaultMessage: 'Show Incompatible Plugins'
  },
  marketplaceUnavailable: {
    id: 'createSiteDialog.marketplaceUnavailable',
    defaultMessage: 'CrafterCMS Marketplace is unavailable at this time'
  },
  retry: {
    id: 'words.retry',
    defaultMessage: 'Retry'
  }
});

const siteInitialState: SiteState = {
  blueprint: null,
  siteId: '',
  siteName: '',
  siteIdExist: false,
  siteNameExist: false,
  invalidSiteId: false,
  description: '',
  pushSite: false,
  useRemote: false,
  createAsOrphan: false,
  repoUrl: '',
  repoAuthentication: 'none',
  repoRemoteBranch: '',
  sandboxBranch: '',
  repoRemoteName: '',
  repoPassword: '',
  repoUsername: '',
  repoToken: '',
  repoKey: '',
  submitted: false,
  selectedView: 0,
  details: { blueprint: null, index: null },
  blueprintFields: {},
  expanded: {
    basic: false,
    token: false,
    key: false
  },
  showIncompatible: true,
  gitBranch: ''
};

const searchInitialState = {
  searchKey: '',
  searchSelected: false
};

const useStyles = makeStyles()((theme) => ({
  fadeIn: {
    animation: `${keyframes`${fadeIn}`} 1s`
  },
  containerGrid: {
    alignContent: 'baseline'
  },
  paperScrollPaper: {
    height: 'calc(100% - 100px)',
    maxHeight: '1200px'
  },
  searchContainer: {
    width: '100%',
    zIndex: 1
  },
  dialogContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  dialogContent: {
    padding: 0
  },
  slide: {
    flexWrap: 'wrap',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    padding: '25px'
  },
  simpleTab: {
    minWidth: '80px',
    minHeight: '0',
    padding: '0 0 5px 0',
    marginRight: '20px',
    opacity: 1,
    '& span': {
      textTransform: 'none'
    }
  },
  tabIcon: {
    fontSize: '1.2rem',
    cursor: 'pointer',
    '&.selected': {
      color: theme.palette.primary.main
    }
  },
  loading: {
    position: 'relative',
    padding: 16,
    flexGrow: 1
  },
  spinner: {
    marginRight: '10px',
    color: theme.palette.text.secondary
  },
  statePaper: {
    height: '100%'
  },
  loadingStateRoot: {
    height: '100%',
    margin: 0
  },
  loadingStateGraphicRoot: {
    flexGrow: 1,
    paddingBottom: '100px'
  },
  loadingStateGraphic: {
    width: 200
  },
  errorPaperRoot: {
    height: '100%'
  },
  blueprintFormRoot: {
    marginTop: 10
  },
  emptyStateRoot: {
    width: '100%'
  },
  showIncompatible: {
    marginLeft: 'auto'
  },
  showIncompatibleInput: {
    fontSize: '0.8125rem'
  },
  showIncompatibleCheckbox: {
    paddingTop: 0,
    paddingBottom: 0
  },
  marketplaceActions: {
    display: 'flex',
    alignItems: 'center'
  },
  marketplaceUnavailable: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    rowGap: theme.spacing(2),
    padding: theme.spacing(5)
  },
  marketplaceUnavailableIcon: {
    color: theme.palette.text.secondary
  }
}));

interface CreateSiteDialogProps {
  open: boolean;
  onClose?(): any;
}

function CreateSiteDialog(props: CreateSiteDialogProps) {
  const [blueprints, setBlueprints] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [disableEnforceFocus, setDisableEnforceFocus] = useState(false);
  const [dialog, setDialog] = useSpreadState({
    open: nnou(props.open) ? props.open : true,
    inProgress: false
  });
  const [apiState, setApiState] = useSpreadState({
    creatingSite: false,
    error: false,
    global: false,
    errorResponse: null,
    fetchingMarketplace: false,
    marketplaceError: false
  });
  const [search, setSearch] = useState(searchInitialState);
  const [site, setSite] = useSpreadState(siteInitialState);
  const { classes, cx } = useStyles();
  const finishRef = useRef(null);
  const { current: refts } = useRef<any>({});
  refts.setSite = setSite;
  const { formatMessage } = useIntl();
  const { authoringBase, useBaseDomain } = useEnv();

  useEffect(() => {
    setDialog({ open: props.open });
  }, [props.open, setDialog]);

  const views: Views = {
    0: {
      title: formatMessage(messages.createSite)
    },
    1: {
      title: formatMessage(messages.createSite),
      subtitle: formatMessage(messages.nameAndDescription),
      btnText: formatMessage(messages.review)
    },
    2: {
      title: formatMessage(messages.finish),
      subtitle: formatMessage(messages.reviewSite),
      btnText: formatMessage(messages.createSite)
    }
  };

  function filterBlueprints(blueprints: MarketplacePlugin[], searchKey: string) {
    searchKey = searchKey.toLowerCase();
    return searchKey && blueprints
      ? blueprints.filter((blueprint) => blueprint.name.toLowerCase().includes(searchKey))
      : blueprints;
  }

  const filteredMarketplace: MarketplacePlugin[] = filterBlueprints(marketplace, search.searchKey);

  const fetchMarketplaceBlueprints = useCallback(() => {
    setApiState({ fetchingMarketplace: true });
    return fetchMarketplaceBlueprintsService({
      showIncompatible: site.showIncompatible
    }).subscribe({
      next: (plugins) => {
        setApiState({ marketplaceError: false, fetchingMarketplace: false });
        setMarketplace(plugins);
      },
      error: ({ response }) => {
        if (response) {
          setApiState({
            creatingSite: false,
            error: true,
            marketplaceError: response.response,
            fetchingMarketplace: false
          });
        }
      }
    });
  }, [setApiState, site?.showIncompatible]);

  setRequestForgeryToken();

  useEffect(() => {
    const loginListener = function (event: any) {
      if (event.detail.state === 'logged') {
        setDisableEnforceFocus(false);
      } else if (event.detail.state === 'reLogin') {
        setDisableEnforceFocus(true);
      }
    };
    document.addEventListener('login', loginListener, false);
    return () => {
      document.removeEventListener('login', loginListener, false);
    };
  }, []);

  useEffect(() => {
    let subscriptions: Subscription[] = [];
    if (blueprints === null && !apiState.error) {
      subscriptions.push(
        fetchBuiltInBlueprints().subscribe({
          next: (blueprints) => {
            setBlueprints([
              {
                id: 'GIT',
                name: formatMessage(messages.gitBlueprintName),
                description: formatMessage(messages.gitBlueprintDescription),
                documentation: null,
                media: {
                  screenshots: [
                    {
                      description: '',
                      title: formatMessage(messages.gitBlueprintName),
                      url: gitLogo
                    }
                  ],
                  videos: []
                }
              },
              ...blueprints.map((bp) => bp.plugin)
            ]);
          },
          error: ({ response }) => {
            if (response) {
              setApiState({ creatingSite: false, errorResponse: response.response });
            }
          }
        })
      );
    }
    if (marketplace === null && !apiState.error) {
      subscriptions.push(fetchMarketplaceBlueprints());
    }
    if (finishRef && finishRef.current && site.selectedView === 2) {
      finishRef.current.focus();
    }
    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [
    apiState.error,
    blueprints,
    formatMessage,
    marketplace,
    setApiState,
    site.selectedView,
    site.showIncompatible,
    fetchMarketplaceBlueprints
  ]);

  function cleanDialogState() {
    setDialog({ open: false, inProgress: false });
    setSite(siteInitialState);
    setSearch(searchInitialState);
  }

  function handleClose(event?: any, reason?: string) {
    const formInProgress = isFormInProgress();

    if (reason === 'escapeKeyDown' && site.details.blueprint) {
      setSite({ details: { blueprint: null, index: null } });
    } else if (
      (reason === 'escapeKeyDown' || reason === 'closeButton' || reason === 'backdropClick') &&
      formInProgress
    ) {
      setDialog({ inProgress: true });
    } else {
      // call externalClose fn
      cleanDialogState();
      props.onClose?.();
    }
  }

  function onConfirmOk() {
    handleClose(null, null);
  }

  function onConfirmCancel() {
    setDialog({ inProgress: false });
  }

  function isFormInProgress() {
    let inProgress = false;
    const keys = [
      'siteId',
      'description',
      'repoUrl',
      'repoAuthentication',
      'repoRemoteBranch',
      'sandboxBranch',
      'repoRemoteName',
      'repoPassword',
      'repoUsername',
      'repoToken',
      'repoKey'
    ];

    keys.forEach((key: string) => {
      if (site[key] !== siteInitialState[key]) {
        inProgress = true;
      }
    });

    Object.keys(site.blueprintFields).forEach((key: string) => {
      if (site.blueprintFields[key] !== '') {
        inProgress = true;
      }
    });

    return inProgress;
  }

  function handleCloseDetails() {
    setSite({ details: { blueprint: null, index: null } });
  }

  function handleErrorBack() {
    setApiState({ error: false, global: false });
  }

  function handleSearchClick() {
    setSearch({ ...search, searchSelected: !search.searchSelected, searchKey: '' });
  }

  function handleOnSearchChange(searchKey: string) {
    setSearch({ ...search, searchKey });
  }

  function handleBlueprintSelected(blueprint: MarketplacePlugin, view: number) {
    if (blueprint.id === 'GIT') {
      setSite({
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        pushSite: false,
        createAsOrphan: false,
        details: { blueprint: null, index: null }
      });
    } else if (blueprint.source === 'GIT') {
      setSite({
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        pushSite: false,
        createAsOrphan: true,
        details: { blueprint: null, index: null }
      });
    } else {
      setSite({
        selectedView: view,
        submitted: false,
        blueprint: blueprint,
        createAsOrphan: true,
        details: { blueprint: null, index: null }
      });
    }
  }

  function handleBack() {
    let back = site.selectedView - 1;
    setSite({ selectedView: back });
  }

  function handleGoTo(step: number) {
    setSite({ selectedView: step });
  }

  function handleFinish(e: MouseEvent) {
    e && e.preventDefault();
    if (site.selectedView === 1) {
      if (validateForm() && !site.siteIdExist) {
        setSite({ selectedView: 2 });
      } else {
        setSite({ submitted: true });
      }
    }
    if (site.selectedView === 2) {
      setApiState({ creatingSite: true });
      // it is a marketplace plugin
      if (site.blueprint.source === 'GIT') {
        const marketplaceParams: MarketplaceSite = createMarketplaceParams();
        createNewSiteFromMarketplace(marketplaceParams);
      } else {
        const blueprintParams = createParams();
        createSite(blueprintParams);
      }
    }
  }

  function handleShowIncompatibleChange(e: ChangeEvent<HTMLInputElement>) {
    setMarketplace(null);
    setSite({ showIncompatible: e.target.checked });
  }

  function checkAdditionalFields() {
    let valid = true;
    if (site.blueprint.parameters) {
      site.blueprint.parameters.forEach((parameter: any) => {
        if (parameter.required && !site.blueprintFields[parameter.name]) {
          valid = false;
        }
      });
    }
    return valid;
  }

  function validateForm() {
    if (!site.siteId || site.siteIdExist || !site.siteName || site.siteNameExist || site.invalidSiteId) {
      return false;
    } else if (!site.repoUrl && site.blueprint.id === 'GIT') {
      return false;
    } else if (site.pushSite || site.blueprint.id === 'GIT') {
      if (!site.repoUrl) return false;
      else if (site.repoAuthentication === 'basic' && (!site.repoUsername || !site.repoPassword)) return false;
      else if (site.repoAuthentication === 'token' && (!site.repoUsername || !site.repoToken)) return false;
      else return !(site.repoAuthentication === 'key' && !site.repoKey);
    } else {
      return checkAdditionalFields();
    }
  }

  function createMarketplaceParams() {
    const params: MarketplaceSite = {
      siteId: site.siteId,
      name: site.siteName,
      description: site.description,
      blueprintId: site.blueprint.id,
      blueprintVersion: {
        major: site.blueprint.version.major,
        minor: site.blueprint.version.minor,
        patch: site.blueprint.version.patch
      }
    };
    if (site.gitBranch) params.sandboxBranch = site.gitBranch as string;
    if (site.blueprintFields) params.siteParams = site.blueprintFields;
    return params;
  }

  function createParams() {
    if (site.blueprint) {
      const params: CreateSiteMeta = {
        siteId: site.siteId,
        singleBranch: false,
        createAsOrphan: site.createAsOrphan,
        siteName: site.siteName
      };
      if (site.blueprint.id !== 'GIT') {
        params.blueprint = site.blueprint.id;
      } else {
        params.useRemote = true;
      }
      if (site.gitBranch) params.sandboxBranch = site.gitBranch as string;
      if (site.description) params.description = site.description;
      if (site.pushSite || site.blueprint.id === 'GIT') {
        params.authenticationType = site.repoAuthentication;
        if (site.repoRemoteName) params.remoteName = site.repoRemoteName;
        if (site.repoUrl) params.remoteUrl = site.repoUrl;
        if (site.gitBranch) {
          params.remoteBranch = site.gitBranch as string;
        }
        if (site.repoAuthentication === 'basic') {
          params.remoteUsername = site.repoUsername;
          params.remotePassword = site.repoPassword;
        }
        if (site.repoAuthentication === 'token') {
          params.remoteUsername = site.repoUsername;
          params.remoteToken = site.repoToken;
        }
        if (site.repoAuthentication === 'key') params.remotePrivateKey = site.repoKey;
      }
      if (Object.keys(site.blueprintFields).length) params.siteParams = site.blueprintFields;
      params.createOption = site.pushSite ? 'push' : 'clone';
      return params;
    }
  }

  function createSite(site: CreateSiteMeta | MarketplaceSite, fromMarketplace = false) {
    const success = () => {
      setApiState({ creatingSite: false });
      handleClose();
      // Prop differs between regular site and marketplace site due to API versions 1 vs 2 differences
      setSiteCookie(site.siteId, useBaseDomain);
      window.location.href = getSystemLink({
        systemLinkId: 'preview',
        authoringBase,
        site: site.siteId,
        page: '/'
      });
    };
    const error = ({ response }) => {
      if (response) {
        if (fromMarketplace) {
          setApiState({
            creatingSite: false,
            error: true,
            errorResponse: response,
            global: true
          });
        } else {
          // TODO: I'm wrapping the API response as a API2 response, change it when create site is on API2
          const _response = { ...response, code: '', documentationUrl: '', remedialAction: '' };
          setApiState({
            creatingSite: false,
            error: true,
            errorResponse: _response,
            global: true
          });
        }
      }
    };
    if (fromMarketplace) {
      createSiteFromMarketplace(site as MarketplaceSite).subscribe(success, error);
    } else {
      create(site as CreateSiteMeta).subscribe(success, error);
    }
  }

  function createNewSiteFromMarketplace(site: MarketplaceSite) {
    createSite(site, true);
  }

  function checkNameExist(siteId: string) {
    if (siteId) {
      exists(siteId).subscribe(
        (exists) => {
          if (exists) {
            refts.setSite({ siteIdExist: exists, selectedView: 1 });
          } else {
            refts.setSite({ siteIdExist: false });
          }
        },
        ({ response }) => {
          // TODO: I'm wrapping the API response as a API2 response, change it when create site is on API2
          const _response = { ...response, code: '', documentationUrl: '', remedialAction: '' };
          setApiState({ creatingSite: false, error: true, errorResponse: _response });
        }
      );
    }
  }

  function onDetails(blueprint: MarketplacePlugin, index: number) {
    setSite({ details: { blueprint: blueprint, index: index } });
  }

  function renderBlueprints(list: MarketplacePlugin[], isMarketplace: boolean = false) {
    return list.map((item: MarketplacePlugin) => {
      const isGitItem = item.id === 'GIT';
      return (
        <Grid item xs={12} sm={isGitItem ? 12 : 6} md={isGitItem ? 12 : 4} lg={isGitItem ? 12 : 3} key={item.id}>
          <PluginCard
            plugin={item}
            onPluginSelected={handleBlueprintSelected}
            changeImageSlideInterval={5000}
            isMarketplacePlugin={isMarketplace}
            onDetails={onDetails}
          />
        </Grid>
      );
    });
  }

  return (
    <Dialog
      open={dialog.open}
      onClose={handleClose}
      aria-labelledby="create-site-dialog"
      fullWidth
      maxWidth="lg"
      classes={{ paperScrollPaper: classes.paperScrollPaper }}
      disableEnforceFocus={disableEnforceFocus}
    >
      <ConfirmDialog
        open={dialog.inProgress}
        onOk={onConfirmOk}
        onCancel={onConfirmCancel}
        body={formatMessage(messages.dialogCloseMessage)}
        title={formatMessage(messages.dialogCloseTitle)}
        disableEnforceFocus={disableEnforceFocus}
      />
      {apiState.creatingSite || (apiState.error && apiState.global) || site.details.blueprint ? (
        (apiState.creatingSite && (
          <div className={classes.statePaper}>
            <LoadingState
              title={formatMessage(messages.creatingSite)}
              subtitle={formatMessage(messages.pleaseWait)}
              classes={{
                root: classes.loadingStateRoot,
                graphicRoot: classes.loadingStateGraphicRoot,
                graphic: classes.loadingStateGraphic
              }}
            />
          </div>
        )) ||
        (apiState.error && (
          <ApiResponseErrorState
            classes={{ root: classes.errorPaperRoot }}
            error={apiState.errorResponse}
            onButtonClick={handleErrorBack}
          />
        )) ||
        (site.details && (
          <PluginDetailsView
            plugin={site.details.blueprint}
            selectedImageSlideIndex={site.details.index}
            onBlueprintSelected={handleBlueprintSelected}
            onCloseDetails={handleCloseDetails}
            changeImageSlideInterval={5000}
            isMarketplacePlugin={Boolean(site?.details.blueprint.url)}
          />
        ))
      ) : (
        <div className={classes.dialogContainer}>
          <DialogHeader
            title={views[site.selectedView].title}
            subtitle={views[site.selectedView].subtitle}
            id="create-site-dialog"
            onCloseButtonClick={handleClose}
          />

          {blueprints ? (
            <DialogBody classes={{ root: classes.dialogContent }}>
              {site.selectedView === 0 && (
                <div className={cx(classes.slide, classes.fadeIn)}>
                  <Grid container spacing={3} className={classes.containerGrid}>
                    {renderBlueprints(blueprints)}
                    <Grid item xs={12}>
                      <Divider sx={{ ml: -3, mr: -3 }} />
                    </Grid>
                    <Grid item xs={12} className={classes.marketplaceActions}>
                      <Typography color="text.secondary" variant="overline" sx={{ mr: 2 }}>
                        {formatMessage(messages.publicMarketplaceBlueprints)}
                      </Typography>
                      <IconButton size="small" onClick={handleSearchClick}>
                        <SearchIcon />
                      </IconButton>
                      <FormControlLabel
                        className={classes.showIncompatible}
                        control={
                          <Checkbox
                            checked={site.showIncompatible}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleShowIncompatibleChange(e)}
                            color="primary"
                            className={classes.showIncompatibleCheckbox}
                          />
                        }
                        label={
                          <Typography className={classes.showIncompatibleInput}>
                            {formatMessage(messages.showIncompatible)}
                          </Typography>
                        }
                        labelPlacement="start"
                      />
                    </Grid>
                    {search.searchSelected && site.selectedView === 0 && (
                      <Grid item xs={12}>
                        <div className={classes.searchContainer}>
                          <SearchBar
                            showActionButton={Boolean(search.searchKey)}
                            onChange={handleOnSearchChange}
                            keyword={search.searchKey}
                            autoFocus={true}
                          />
                        </div>
                      </Grid>
                    )}
                    {apiState.marketplaceError ? (
                      <Box className={classes.marketplaceUnavailable}>
                        <SignalWifiBadRounded className={classes.marketplaceUnavailableIcon} />
                        <Typography variant="body1" color="text.secondary">
                          {formatMessage(messages.marketplaceUnavailable)}
                        </Typography>
                        <Button variant="text" onClick={fetchMarketplaceBlueprints}>
                          {formatMessage(messages.retry)}
                        </Button>
                      </Box>
                    ) : apiState?.fetchingMarketplace ? ( // TODO: test - should I empty bps and check for null?
                      <Box sx={{ width: '100%' }}>
                        <LoadingState />
                      </Box>
                    ) : !filteredMarketplace || filteredMarketplace?.length === 0 ? (
                      <EmptyState
                        title={formatMessage(messages.noMarketplaceBlueprints)}
                        subtitle={formatMessage(messages.changeQuery)}
                        classes={{ root: classes.emptyStateRoot }}
                      />
                    ) : (
                      renderBlueprints(filteredMarketplace, true)
                    )}
                  </Grid>
                </div>
              )}
              {site.selectedView === 1 && (
                <div className={cx(classes.slide, classes.fadeIn)}>
                  {site.blueprint && (
                    <BlueprintForm
                      inputs={site}
                      setInputs={setSite}
                      onCheckNameExist={checkNameExist}
                      onSubmit={handleFinish}
                      blueprint={site.blueprint}
                      classes={{ root: classes.blueprintFormRoot }}
                    />
                  )}
                </div>
              )}
              {site.selectedView === 2 && (
                <div className={cx(classes.slide, classes.fadeIn)}>
                  {site.blueprint && <BlueprintReview onGoTo={handleGoTo} inputs={site} blueprint={site.blueprint} />}
                </div>
              )}
            </DialogBody>
          ) : apiState.error ? (
            <ApiResponseErrorState classes={{ root: classes.errorPaperRoot }} error={apiState.errorResponse} />
          ) : (
            <div className={classes.loading}>
              <Spinner background="none" />
            </div>
          )}
          {site.selectedView !== 0 && (
            <DialogFooter classes={{ root: classes.fadeIn }}>
              <Button color="primary" variant="outlined" onClick={handleBack} children={formatMessage(messages.back)} />
              <PrimaryButton ref={finishRef} onClick={handleFinish} children={views[site.selectedView].btnText} />
            </DialogFooter>
          )}
        </div>
      )}
    </Dialog>
  );
}

export default CreateSiteDialog;
