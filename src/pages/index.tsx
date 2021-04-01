import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  posts: Post[];
  postsPagination: PostPagination;
}

export default function Home({posts, postsPagination}: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map((post) => (
              <Link key={ post.uid } href={`/posts/${post.uid}`}>
                <a>
                  <h2>{ post.data.title }</h2>
                  <strong>
                    { post.data.subtitle }
                  </strong>
                  <div>
                    <span>
                      <FiCalendar />
                      <time>{ post.first_publication_date }</time>
                    </span>
                    <span>
                      <FiUser />
                      <strong>{ post.data.author }</strong>
                    </span>
                  </div>
                </a>
              </Link>
            ))
          }
        </div>
        <footer className={styles.containerFooter}>
          <button>
            Carregar mais posts
          </button>
        </footer>
      </main>
    </>
  )
}

export const getStaticProps:GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 10,
  });

  const posts = postsResponse.results.map(post => {
    console.log(post.first_publication_date)
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM uuuu",
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        author: post.data.author[0].text,
        subtitle: post.data.subtitle[0].text,
      }
    }
  })

  return {
    props: {
      posts,
      next_page: postsResponse.next_page,
    }
  }
};
