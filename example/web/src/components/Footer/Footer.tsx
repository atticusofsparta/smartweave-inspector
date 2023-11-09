import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons';

function Footer() {
  return (
    <div className="footer dark">
      <div className="footer-links dark">
        <a href="https://discord.gg/PkjjV4KW">
          <DiscordLogoIcon /> Discord
        </a>
        <a href="https://github.com/atticusofsparta/smartweave-inspector">
          <GitHubLogoIcon /> Github
        </a>
        <a href="https://twitter.com/SanOfABee">
          <TwitterLogoIcon /> Twitter
        </a>
        <a href="https://yourwebsite.com/terms-and-conditions">
          Terms and Conditions
        </a>
      </div>
    </div>
  );
}

export default Footer;
