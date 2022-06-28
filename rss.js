const Parser = require('rss-parser')
const parser = new Parser()
const fs = require('fs');

const totalPodcastEpisode = 5
const podcasts = [
  {
    spotifyId: '5ZW8phuJoLC1go6GoHhY2x',
    rss: 'https://feeds.acast.com/public/shows/haschimitenfurst-der-bobcast'
  },
  {
    spotifyId: '2pveTPyvS5Mg62S35WCztY',
    rss: 'https://www.deutschlandfunknova.de/podcast/eine-stunde-history'
  },
  {
    wikiDataId: 'Q110914241',
    spotifyId: '28xB1TuIMy3xIjng8diGWT',
    rss: 'https://mordaufex.podigee.io/feed/mp3'
  },
  {
    wikiDataId: 'Q60697596',
    spotifyId: '6wPqbSlsvoi3Rgjjc2Sn4R',
    rss: 'https://mordlust-podcast.podigee.io/feed/mp3'
  },
  {
    wikiDataId: 'Q85850769',
    spotifyId: '3jtLk2Zlutfjo91QZYXmlA',
    rss: 'https://baywatch-berlin.podigee.io/feed/mp3'
  },
  {
    spotifyId: '2TgGzjsd5o9280yF2qDaog',
    rss: 'https://reich-und-schoen.podigee.io/feed/mp3'
  }
];

let data = `
@prefix schema:       <https://schema.org/> .
@prefix rdf:          <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:         <http://www.w3.org/2000/01/rdf-schema#> .
@prefix wd:           <http://www.wikidata.org/entity/> .
@prefix owl:          <http://www.w3.org/2002/07/owl#> .
@prefix xsd:          <http://www.w3.org/2001/XMLSchema#> .
@prefix spotify:      <https://bmake.th-brandenburg.de/spotify/> .
@prefix pers:         <https://bmake.th-brandenburg.de/pers/> .
@prefix orga:         <https://bmake.th-brandenburg.de/orga/> .


### Person ###
pers:LeonieBartsch a schema:Person ;
    schema:name               "Leonie Bartsch" ;
    schema:alternateName      "" ;
    schema:url                "" .

pers:LinnSchütze a schema:Person ;
    schema:name               "Linn Schütze" ;
    schema:alternateName      "" ;
    schema:url                "" .

wd:Q1273716 a schema:Person ;
    schema:name               "Kai Schwind" ;
    schema:alternateName      "" ;
    schema:url                wd:Q1273716 .

wd:Q124660 a schema:Person ;
    schema:name               "Andreas Fröhlich" ;
    schema:alternateName      "" ;
    schema:url                wd:Q124660 .

wd:Q68462943 a schema:Person ;
    schema:name               "Tommi Schmitt" ;
    schema:alternateName      "Thomas Schmitt" ;
    schema:url                wd:Q68462943 .
    
pers:LisaSophieScheurell a schema:Person ;
    schema:name               "Lisa-Sophie Scheurell" ;
    schema:alternateName      "" ;
    schema:url                "" .
    
pers:PaulinaKrasa a schema:Person ;
    schema:name               "Paulina Krasa" ;
    schema:alternateName      "" ;
    schema:url                "" .
    
pers:LauraWohlers a schema:Person ;
    schema:name               "Laura Wohlers" ;
    schema:alternateName      "" ;
    schema:url                "" .
    
wd:Q109360 a schema:Person ;
    schema:name               "Klaas Heufer-Umlauf" ;
    schema:alternateName      "" ;
    schema:url                wd:Q109360 .
    
wd:Q50821909 a schema:Person ;
    schema:name               "Jakob Lundt" ;
    schema:alternateName      "" ;
    schema:url                wd:Q50821909 .
    
wd:Q1292000 a schema:Person ;
    schema:name               "Kida Ramadan" ;
    schema:alternateName      "Kida Khodr Ramadan" ;
    schema:url                wd:Q1292000 .
    
wd:Q70775 a schema:Person ;
    schema:name               "Frederick Lau" ;
    schema:alternateName      "" ;
    schema:url                wd:Q70775 .
    

###Organization###
wd:Q109943664 a schema:Organization ;
    schema:name               "Spotify Studios" ;
    schema:url                wd:Q109943664 .
    
orga:StudioBummens a schema:Organization ;
    schema:name               "Studio Bummens" ;
    schema:url                "" .
    
wd:Q689141 a schema:Organization ;
    schema:name               "Spotify" ;
    schema:url                wd:Q689141 .
    
wd:Q1155601 a schema:Organization ;
    schema:name               "Deutschlandfunk Nova" ;
    schema:url                wd:Q1155601 .
`

const createTTLData = async (podcasts) => {

  data += `

### Podcast Series ###`
  podcasts.map(podcast => {
    return `
${podcast.wikiDataId !== '' ? `wd:${podcast.wikiDataId}` : `spotify:s_${podcast.spotifyUrl.replace('https://open.spotify.com/show/', '')}`} a schema:PodcastSeries ;
    schema:name               "${podcast.name}" @de ;
    schema:description        "${podcast.description.replace(/[^\S ]+/g,'')}" @de ;
    schema:creator            "${podcast.author}" ;
    schema:maintainer         wd:Q689141 ;
    schema:contributor        "${podcast.contributor}" ;
    schema:isFamilyFriendly   ${podcast.familyFriendly} ;
    schema:inLanguage         "${podcast.language}" ;
    schema:image              "${podcast.image}" ;
    schema:genre              "${podcast.genre.join('", "')}" ;
    schema:webFeed            "${podcast.webFeed}" .
    `
  }).forEach(podcast => data += podcast)

  data += `

### Podcast Episode ###`
  podcasts.forEach(podcast => {
    podcast.episodes.map(episode => {
      return `
spotify:e_${episode.spotifyUrl.replace('https://open.spotify.com/episode/', '')} a schema:PodcastEpisode ;
    schema:name               "${episode.name}" @de ;
    schema:description        "${episode.description.replace(/[^\S ]+/g,'').replace(/"/g, "'")}" @de ;
    schema:duration           "${episode.duration}" ;
    schema:datePublished      "${episode.dataPublished}"^^xsd:date ;
    schema:isPartOf           ${podcast.wikiDataId !== '' ? `wd:${podcast.wikiDataId}` : `spotify:s_${podcast.spotifyUrl.replace('https://open.spotify.com/show/', '')}`} .
      `
    }).forEach(podcast => data += podcast)
  })

  await fs.promises.writeFile('data.ttl', data);
};

(async () => {
  const data = await Promise.all(podcasts.map(async podcast => {
    const feed = await parser.parseURL(podcast.rss)
    const podcastEpisodes = totalPodcastEpisode === 0 ? feed?.items : feed?.items.slice(0, totalPodcastEpisode) ?? []
    return {
      spotifyUrl: `https://open.spotify.com/show/${podcast?.spotifyId}` ?? '',
      wikiDataId: podcast?.wikiDataId ?? '',
      name: feed?.title ?? '',
      description: feed?.description.replace(/<\/?[^>]+(>|$)/g, '') ?? '',
      author: feed?.itunes?.author ?? '',
      maintainer: feed?.generator ?? '',
      contributor: '',
      familyFriendly: feed?.itunes?.explicit === 'no' ? true : false,
      language: feed?.language ?? '',
      image: feed?.image?.url ?? '',
      genre: feed?.itunes?.categories ?? [],
      webFeed: podcast.rss ?? '',
      episodes: podcastEpisodes.map(item => {
        return {
          spotifyUrl: `https://open.spotify.com/episode/${podcast.spotifyId}` ?? '',
          name: item?.title ?? '',
          description: item?.contentSnippet ?? '',
          duration: item?.itunes?.duration?.includes(':') ? item?.itunes?.duration : new Date(item?.itunes?.duration * 1000)?.toISOString().substring(11, 19) ?? '00:00:00',
          dataPublished: item?.isoDate?.substring(0, 10) ?? '',
          audio: item?.enclosure.url ?? ''
        }
      }),
    }
  }))
  // console.log(data)
  await fs.promises.writeFile('podcast.json', JSON.stringify(data, null, 2));
  await createTTLData(data);
})();