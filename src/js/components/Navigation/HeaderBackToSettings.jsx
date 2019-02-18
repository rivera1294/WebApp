import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import BallotStore from "../../stores/BallotStore";
import CandidateStore from "../../stores/CandidateStore";
import cookies from "../../utils/cookies";
import { cordovaDot, hasIPhoneNotch, historyPush, isWebApp } from "../../utils/cordovaUtils";
import HeaderBarProfilePopUp from "./HeaderBarProfilePopUp";
import OrganizationActions from "../../actions/OrganizationActions";
import OrganizationStore from "../../stores/OrganizationStore";
import { renderLog } from "../../utils/logging";
import VoterGuideActions from "../../actions/VoterGuideActions";
import VoterSessionActions from "../../actions/VoterSessionActions";
import { shortenText } from "../../utils/textFormat";
import avatarGeneric from "../../../img/global/svg-icons/avatar-generic.svg";

export default class HeaderBackToSettings extends Component {
  static propTypes = {
    location: PropTypes.object,
    params: PropTypes.object.isRequired,
    pathname: PropTypes.string,
    voter: PropTypes.object,
  };

  constructor (props) {
    super(props);
    this.state = {
      profilePopUpOpen: false,
      candidateWeVoteId: "",
      organization: {},
      organizationWeVoteId: "",
      voter: {},
    };
    this.toggleAccountMenu = this.toggleAccountMenu.bind(this);
    this.hideAccountMenu = this.hideAccountMenu.bind(this);
    this.transitionToYourVoterGuide = this.transitionToYourVoterGuide.bind(this);
    this.toggleProfilePopUp = this.toggleProfilePopUp.bind(this);
    this.hideProfilePopUp = this.hideProfilePopUp.bind(this);
    this.transitionToYourVoterGuide = this.transitionToYourVoterGuide.bind(this);
    this.signOutAndHideProfilePopUp = this.signOutAndHideProfilePopUp.bind(this);
  }

  componentDidMount () {
    // console.log("HeaderBackToBar componentDidMount, this.props: ", this.props);
    this.ballotStoreListener = BallotStore.addListener(this.onBallotStoreChange.bind(this));
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.onBallotStoreChange();

    let candidateWeVoteId;
    let officeWeVoteId;
    let officeName;
    let organization = {};
    let organizationWeVoteId;
    if (this.props.params) {
      candidateWeVoteId = this.props.params.candidate_we_vote_id || "";
      if (candidateWeVoteId && candidateWeVoteId !== "") {
        const candidate = CandidateStore.getCandidate(candidateWeVoteId);

        // console.log("HeaderBackToBar, candidateWeVoteId:", candidateWeVoteId, ", candidate:", candidate);
        officeWeVoteId = candidate.contest_officeWeVoteId;
        officeName = candidate.contest_office_name;
      }

      organizationWeVoteId = this.props.params.organization_we_vote_id || "";
      organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (organizationWeVoteId && organizationWeVoteId !== "" && !organization.organization_we_vote_id) {
        // Retrieve the organization object
        OrganizationActions.organizationRetrieve(organizationWeVoteId);
      }
    }

    // console.log("candidateWeVoteId: ", candidateWeVoteId);
    // console.log("organizationWeVoteId: ", organizationWeVoteId);

    const weVoteBrandingOffFromUrl = this.props.location.query ? this.props.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem("we_vote_branding_off");
    this.setState({
      candidateWeVoteId,
      officeName,
      officeWeVoteId,
      organization,
      organizationWeVoteId,
      voter: this.props.voter,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  componentWillReceiveProps (nextProps) {
    // console.log("HeaderBackToBar componentWillReceiveProps, nextProps: ", nextProps);
    let candidateWeVoteId;
    let officeWeVoteId;
    let officeName;
    let organization = {};
    let organizationWeVoteId;
    if (nextProps.params) {
      candidateWeVoteId = nextProps.params.candidate_we_vote_id || "";
      if (candidateWeVoteId && candidateWeVoteId !== "") {
        const candidate = CandidateStore.getCandidate(candidateWeVoteId);

        // console.log("HeaderBackToBar, candidateWeVoteId:", candidateWeVoteId, ", candidate:", candidate);
        officeWeVoteId = candidate.contest_office_we_vote_id;
        officeName = candidate.contest_office_name;
      }

      organizationWeVoteId = nextProps.params.organization_we_vote_id || "";
      organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (organizationWeVoteId && organizationWeVoteId !== "" && !organization.organization_we_vote_id) {
        // Retrieve the organization object
        OrganizationActions.organizationRetrieve(organizationWeVoteId);
      }
    }

    // console.log("candidateWeVoteId: ", candidateWeVoteId);
    // console.log("organizationWeVoteId: ", organizationWeVoteId);

    const weVoteBrandingOffFromUrl = nextProps.location.query ? nextProps.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem("we_vote_branding_off");
    this.setState({
      candidateWeVoteId,
      officeName,
      officeWeVoteId,
      organization,
      organizationWeVoteId,
      voter: nextProps.voter,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  componentWillUnmount () {
    this.ballotStoreListener.remove();
    this.candidateStoreListener.remove();
    this.organizationStoreListener.remove();
  }

  onBallotStoreChange () {
    // this.setState({ bookmarks: BallotStore.bookmarks });
  }

  onCandidateStoreChange () {
    // console.log("Candidate onCandidateStoreChange");
    const { candidateWeVoteId } = this.state;
    let officeName;
    let officeWeVoteId;
    if (candidateWeVoteId && candidateWeVoteId !== "") {
      const candidate = CandidateStore.getCandidate(candidateWeVoteId);

      // console.log("HeaderBackToBar -- onCandidateStoreChange, candidateWeVoteId:", this.state.candidateWeVoteId, ", candidate:", candidate);
      officeName = candidate.contest_office_name;
      officeWeVoteId = candidate.contest_office_we_vote_id;
    }

    this.setState({
      officeName,
      officeWeVoteId,
    });
  }

  onOrganizationStoreChange () {
    const { organizationWeVoteId } = this.state;
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
    });
  }

  getOfficeLink () {
    if (this.state.organizationWeVoteId && this.state.organizationWeVoteId !== "") {
      return `/office/${this.state.officeWeVoteId}/btvg/${this.state.organizationWeVoteId}`;
    } else {
      return `/office/${this.state.officeWeVoteId}/b/btdb/`;
    }
  }

  getVoterGuideLink () {
    return `/voterguide/${this.state.organizationWeVoteId}`;
  }

  transitionToYourVoterGuide () {
    // Positions for this organization, for this voter / election
    OrganizationActions.positionListForOpinionMaker(this.state.voter.linked_organization_we_vote_id, true);

    // Positions for this organization, NOT including for this voter / election
    OrganizationActions.positionListForOpinionMaker(this.state.voter.linked_organization_we_vote_id, false, true);
    OrganizationActions.organizationsFollowedRetrieve();
    VoterGuideActions.voterGuideFollowersRetrieve(this.state.voter.linked_organization_we_vote_id);
    VoterGuideActions.voterGuidesFollowedByOrganizationRetrieve(this.state.voter.linked_organization_we_vote_id);
    this.setState({ profilePopUpOpen: false });
  }

  hideAccountMenu () {
    this.setState({ profilePopUpOpen: false });
  }

  toggleAccountMenu () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  toggleProfilePopUp () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  hideProfilePopUp () {
    this.setState({ profilePopUpOpen: false });
  }

  signOutAndHideProfilePopUp () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  signOutAndHideAccountMenu () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  render () {
    renderLog(__filename);
    const voterPhotoUrlMedium = this.state.voter.voter_photo_url_medium;
    const backToLink = isWebApp() ? "/settings/menu" : "/more/hamburger";

    let backToOrganizationLinkText;
    if (this.state.organizationWeVoteId && this.state.organizationWeVoteId !== "") {
      backToOrganizationLinkText = "Back to Voter Guide22";
    } else {
      backToOrganizationLinkText = "Back to Settings";
    }

    if (this.props.params.back_to_variable === "bto" || this.props.params.back_to_variable === "btdo") {
      if (this.state.officeName) {
        backToOrganizationLinkText = `Back to ${this.state.officeName}`;
      } else {
        backToOrganizationLinkText = "Back";
      }
    } else if (this.state.organization && this.state.organization.organization_name) {
      backToOrganizationLinkText = `Back to ${this.state.organization.organization_name}`;
    }

    const backToOrganizationLinkTextMobile = shortenText(backToOrganizationLinkText, 30);
    const headerClassName = (function header () {
      if (isWebApp()) {
        return "page-header";
      } else {
        return hasIPhoneNotch() ? "page-header page-header__cordova-iphonex" : "page-header page-header__cordova";
      }
    }());


    return (
      <header className={headerClassName}>
        <Button
          bsPrefix={`btn btn-sm btn-default page-header__backToButton d-none d-sm-block ${hasIPhoneNotch() ? "page-header__backToButtonIPhoneX" : ""}`}
          onClick={() => historyPush(backToLink)}
        >
          <span className="fa fa-arrow-left" />
          {" "}
          {backToOrganizationLinkText}
        </Button>
        <Button
          bsPrefix={`btn btn-sm btn-default page-header__backToButton d-block d-sm-none ${hasIPhoneNotch() ? "page-header__backToButtonIPhoneX" : ""}`}
          onClick={() => historyPush(backToLink)}
        >
          <span className="fa fa-arrow-left" />
          {" "}
          {backToOrganizationLinkTextMobile}
        </Button>

        {this.state.profilePopUpOpen && (
        <HeaderBarProfilePopUp
          {...this.props}
          onClick={this.toggleProfilePopUp}
          profilePopUpOpen={this.state.profilePopUpOpen}
          weVoteBrandingOff={this.state.we_vote_branding_off}
          toggleProfilePopUp={this.toggleProfilePopUp}
          hideProfilePopUp={this.hideProfilePopUp}
          transitionToYourVoterGuide={this.transitionToYourVoterGuide}
          signOutAndHideProfilePopUp={this.signOutAndHideProfilePopUp}
        />
        )}

        {isWebApp() && (
        <div className="header-nav__avatar-wrapper u-cursor--pointer u-flex-none" onClick={this.toggleAccountMenu}>
          {voterPhotoUrlMedium ? (
            <div id="js-header-avatar" className="header-nav__avatar-container">
              <img
                className="header-nav__avatar"
                src={voterPhotoUrlMedium}
                height={34}
                width={34}
              />
            </div>
          ) : (
            <div id="anonIcon" className="header-nav__avatar">
              <img src={cordovaDot(avatarGeneric)} width="34" height="34" color="#c0c0c0" alt="generic voter" />
            </div>
          )}
        </div>
        )}
      </header>
    );
  }
}
