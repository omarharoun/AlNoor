cask "fluxer" do
  version "PLACEHOLDER_VERSION"

  sha256 "PLACEHOLDER_SHA256_ARM64"

  url "https://api.fluxer.app/dl/desktop/stable/darwin/arm64/#{version}/dmg"
  name "Fluxer"
  desc "Instant messaging and VoIP application"
  homepage "https://fluxer.app"

  livecheck do
    url "https://api.fluxer.app/dl/desktop/stable/darwin/arm64/latest"
    strategy :json do |json|
      json["version"]
    end
  end

  auto_updates true
  depends_on macos: ">= :catalina"

  app "Fluxer.app"

  zap trash: [
    "~/Library/Application Support/fluxer",
    "~/Library/Caches/app.fluxer",
    "~/Library/Caches/app.fluxer.ShipIt",
    "~/Library/Preferences/app.fluxer.plist",
    "~/Library/Saved Application State/app.fluxer.savedState",
  ]
end
