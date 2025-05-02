            const channels = [
{
        name: 'TV5',
        logo: 'https://i.imgur.com/Ddyfzrn.png',
        type: 'mpd',
        url: 'https://qp-pldt-live-grp-02-prod.akamaized.net/out/u/tv5_hd.mpd',
        keyId: '2615129ef2c846a9bbd43a641c7303ef',
        key: '07c7f996b1734ea288641a68e1cfdc4d',
                 },	 
         {        
name: 'GAME 6 - New York Knicks vs Detroit Pistons 7:30pm',
        url: 'https://locked.pixelsport.to/psportsgate/psportsgate100/86.m3u8',
        type: 'hls',
		logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8P3joEa5YrAYgs-W8KNl81HP2DHf-p0zSisFeWwV6W4pnkp8mfiwwF9I&s=10'
         }
            ];	
			
	async function cleanupPlayers() {
                youtubeEmbed.src = '';
                youtubeEmbed.style.display = 'none';

                if (shakaPlayer) {
                    await shakaPlayer.destroy();
                    shakaPlayer = null;
                }

                if (hlsPlayer) {
                    hlsPlayer.destroy();
                    hlsPlayer = null;
                }

                video.style.display = 'block';
                video.src = '';
                video.load();
            }

            async function playStream(channel) {
                try {
                    await cleanupPlayers();

                    if (channel.type === 'youtube') {
                        video.style.display = 'none';
                        youtubeEmbed.style.display = 'block';
                        youtubeEmbed.src = `${channel.embedUrl}&autoplay=1`;
                    } else if (channel.type === 'hls') {
                        hlsPlayer = initializeHLSPlayer();
                        if (hlsPlayer) {
                            hlsPlayer.loadSource(channel.url);
                            hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                                video.play();
                            });
                        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                            // Fallback for Safari
                            video.src = channel.url;
                            video.play();
                        }
                    } else if (channel.type === 'mpd') {
                        shakaPlayer = initializeShakaPlayer();
                        
                        if (channel.keyId && channel.key) {
                            shakaPlayer.configure({
                                drm: {
                                    clearKeys: {
                                        [channel.keyId]: channel.key
                                    }
                                }
                            });
                        }

                        await shakaPlayer.load(channel.url);
                        video.play();
                    }
                } catch (error) {
                    console.error('Error playing stream:', error);
                }
            }

            function renderChannelList(channelsToRender) {
                channelList.innerHTML = channelsToRender.map(channel => `
                    <li class="channel-item ${channel === currentChannel ? 'active' : ''}" data-channel-index="${channels.indexOf(channel)}">
                        <div class="channel-content">
                            <div class="channel-logo">
                                <img src="${channel.logo}" alt="${channel.name}" />
                            </div>
                            <div class="channel-info">
                                <div class="channel-name">${channel.name}</div>
                                <div class="channel-type">${channel.type.toUpperCase()}</div>
                            </div>
                        </div>
                    </li>
                `).join('');

                document.querySelectorAll('.channel-item').forEach(item => {
                    item.addEventListener('click', async () => {
                        const channel = channels[parseInt(item.dataset.channelIndex)];
                        currentChannel = channel;
                        await playStream(channel);
                        
                        document.querySelectorAll('.channel-item').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                    });
                });
            }

            renderChannelList(channels);
            if (channels.length > 0) {
                currentChannel = channels[0];
                await playStream(currentChannel);
            }

            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredChannels = channels.filter(channel =>
                    channel.name.toLowerCase().includes(searchTerm)
                );
                renderChannelList(filteredChannels);
            });
        });
