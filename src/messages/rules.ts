import { MessageCreateOptions } from "discord.js";
import { createEmbed } from "../util/other";

const title = ".・゜゜・Rules & Guidelines・゜゜・．";

const embedText1 = `Hello Friend!

Welcome to our little community. We're glad to have you here! :imhappy:

We're super excited for you to jump in the channels, meet new people and make new friends.

But first, we (sadly) have some rules we need you to read through!

Don't worry, our only hope is to use these guidelines to keep you all as safe as possible. :6_grumpyhug:`;

const embedText2 = `:6bunnyconfused: So what rules do I have to follow?

Well, my friend, keep reading below and I'll tell you.

:1: Keep conversations family-friendly. We are an SFW community. Therefore, do not allow any adult content on this server.

:2: 14-year age minimum As per discord regulation, we require you to be at the age of, or older to participate in this server.

:3: Keep disputes to a minimum We understand disagreements may happen. However, they don't make for good conversation. If you have an issue with a staff member or a member of the server. Please open a ticket and we'll handle the situation as necessary.

:4: This is NOT a hook-up server We strongly prefer you engage with members before requesting trances. This ensures a comfortable experience for everyone.

:5: Be kind and respectful We want to ensure everyone has a safe and enjoyable experience in our hideout. Therefore, there is a Zero Tolerance Policy toward anyone on this server.

:6: No offensive profiles This server has participants under 18. We request any explicit or offensive profiles be removed upon joining this server.

:7: No hate speech or hateful conduct Discrimination against anyone regarding race, sexual identity, gender, religion and other personal identities will not be tolerated.`;

const embedText3 = `You've read through our rules. :Yay:

Were you paying attention?

We won't quiz you. But we do need to make sure you agree to the rules.

So, by ticking the check mark :Tick: you are stating that you agree to and will follow the rules listed above. Failing to do so will result in action and investigation by staff.

Once you've done that, create an intro and a staff member will verify you!`;

let message: MessageCreateOptions = {
    embeds: [
        createEmbed()
            .setTitle(title)
            .setDescription(embedText1),

        createEmbed()
            .setTitle(title)
            .setDescription(embedText2),

        createEmbed()
            .setTitle(title)
            .setDescription(embedText3),
    ]
};

export default message;