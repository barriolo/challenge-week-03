import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
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
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.next_page, postsPagination.results]);


  function handleNextPage() {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const newPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              author: post.data.author,
              subtitle: post.data.subtitle,
            }
          }
      })
      setPosts([...posts, ...newPosts]);
      setNextPage(data.next_page);
    })
  }
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <Header />
      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map((post) => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <h2>aa{ post.data.title }</h2>
                  <strong>
                    { post.data.subtitle }
                  </strong>
                  <div>
                    <span>
                      <FiCalendar />
                      <time>{
                        format(
                          new Date(post.first_publication_date),
                          "dd MMM uuuu",
                          {
                            locale: ptBR,
                          }
                        )
                      }</time>
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
          {
            postsPagination.next_page !== null &&
            (
              <button
                onClick={handleNextPage}
              >
                Carregar mais posts
              </button>
            )
          }

        </footer>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
  {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
  });
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      }
    },
    revalidate: 60 * 30, // 30 minutos
  }
}
